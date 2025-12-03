import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  arrayUnion, 
  arrayRemove,
  onSnapshot,
  orderBy,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../firebase/config';

// Generate a random 6-character group code
const generateGroupCode = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

// Create a new group
export const createGroup = async (name, description, createdBy) => {
  try {
    const groupCode = generateGroupCode();
    
    // Extract only the user data we need (avoid Firebase internal properties)
    const userData = {
      uid: createdBy.uid,
      displayName: createdBy.displayName || createdBy.email?.split('@')[0] || 'User',
      email: createdBy.email
    };
    
    const groupData = {
      name,
      description,
      groupCode,
      createdBy: userData,
      members: [userData.uid],
      memberDetails: [{
        uid: userData.uid,
        displayName: userData.displayName,
        email: userData.email,
        joinedAt: new Date().toISOString()
      }],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    const docRef = await addDoc(collection(db, 'groups'), groupData);
    
    // Update user's groups array
    await updateDoc(doc(db, 'users', createdBy.uid), {
      groups: arrayUnion(docRef.id)
    });

    return { id: docRef.id, ...groupData };
  } catch (error) {
    console.error('Error creating group:', error);
    throw error;
  }
};

// Get group by ID
export const getGroup = async (groupId) => {
  try {
    const docRef = doc(db, 'groups', groupId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    } else {
      throw new Error('Group not found');
    }
  } catch (error) {
    console.error('Error getting group:', error);
    throw error;
  }
};

// Helper to fetch expenses for a group
const fetchGroupExpenses = async (groupId) => {
  const expensesRef = collection(db, 'expenses');
  const q = query(expensesRef, where('groupId', '==', groupId));
  const snapshot = await getDocs(q);
  const expenses = [];
  snapshot.forEach(doc => expenses.push({ id: doc.id, ...doc.data() }));
  return expenses;
};

// Get groups for a user (with balances attached)
export const getUserGroups = async (userId) => {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    const userData = userDoc.data();
    const groupIds = userData?.groups || [];

    const groups = [];
    for (const groupId of groupIds) {
      try {
        const group = await getGroup(groupId);

        // Fetch expenses and calculate balances
        const expenses = await fetchGroupExpenses(groupId);
        // Use memberDetails if available, else fallback to members array
        const members = group.memberDetails || (group.members?.map(uid => ({ uid })) || []);
        const balances = calculateBalances(expenses, members);

        groups.push({ ...group, balances });
      } catch (error) {
        console.error(`Error fetching group ${groupId}:`, error);
      }
    }

    return groups.sort((a, b) => {
      const aDate = a.createdAt?.toDate?.() || new Date(0);
      const bDate = b.createdAt?.toDate?.() || new Date(0);
      return bDate - aDate;
    });
  } catch (error) {
    console.error('Error getting user groups:', error);
    throw error;
  }
};

// Join group by code
export const joinGroup = async (groupCode, user) => {
  try {
    // Find group by code
    const groupsRef = collection(db, 'groups');
    const q = query(groupsRef, where('groupCode', '==', groupCode));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      throw new Error('Invalid group code');
    }

    const groupDoc = querySnapshot.docs[0];
    const groupData = groupDoc.data();

    // Check if user is already a member
    if (groupData.members.includes(user.uid)) {
      throw new Error('You are already a member of this group');
    }

    // Add user to group
    await updateDoc(doc(db, 'groups', groupDoc.id), {
      members: arrayUnion(user.uid),
      memberDetails: arrayUnion({
        uid: user.uid,
        displayName: user.displayName || user.email?.split('@')[0] || 'User',
        email: user.email,
        joinedAt: new Date().toISOString()
      }),
      updatedAt: serverTimestamp()
    });

    // Add group to user's groups
    await updateDoc(doc(db, 'users', user.uid), {
      groups: arrayUnion(groupDoc.id)
    });

    return { id: groupDoc.id, ...groupData };
  } catch (error) {
    console.error('Error joining group:', error);
    throw error;
  }
};

// Leave group
export const leaveGroup = async (groupId, userId) => {
  try {
    // Remove user from group
    await updateDoc(doc(db, 'groups', groupId), {
      members: arrayRemove(userId),
      memberDetails: arrayRemove({
        uid: userId
      }),
      updatedAt: serverTimestamp()
    });

    // Remove group from user's groups
    await updateDoc(doc(db, 'users', userId), {
      groups: arrayRemove(groupId)
    });
  } catch (error) {
    console.error('Error leaving group:', error);
    throw error;
  }
};

// Add expense to group
export const addExpense = async (groupId, expenseData) => {
  try {
    const expense = {
      ...expenseData,
      groupId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    const docRef = await addDoc(collection(db, 'expenses'), expense);
    return { id: docRef.id, ...expense };
  } catch (error) {
    console.error('Error adding expense:', error);
    throw error;
  }
};

// Get expenses for a group
export const getGroupExpenses = (groupId, callback) => {
  const expensesRef = collection(db, 'expenses');
  const q = query(
    expensesRef, 
    where('groupId', '==', groupId),
    orderBy('createdAt', 'desc')
  );

  return onSnapshot(q, (snapshot) => {
    const expenses = [];
    snapshot.forEach((doc) => {
      expenses.push({ id: doc.id, ...doc.data() });
    });
    callback(expenses);
  });
};

// Calculate balances for a group
export const calculateBalances = (expenses, members) => {
  const balances = {};
  const memberIds = members.map(member => member.uid);

  // Initialize balances
  memberIds.forEach(memberId => {
    balances[memberId] = 0;
  });

  // Calculate balances
  expenses.forEach(expense => {
    const amount = parseFloat(expense.amount);
    const payerId = expense.payerId;
    const splitAmount = amount / memberIds.length;

    // Payer gets credited the full amount
    balances[payerId] += amount;
    
    // Each member pays their share
    memberIds.forEach(memberId => {
      balances[memberId] -= splitAmount;
    });
  });

  return balances;
};

// Get real-time group updates
export const subscribeToGroup = (groupId, callback) => {
  const groupRef = doc(db, 'groups', groupId);
  
  return onSnapshot(groupRef, (doc) => {
    if (doc.exists()) {
      callback({ id: doc.id, ...doc.data() });
    } else {
      callback(null);
    }
  });
};
