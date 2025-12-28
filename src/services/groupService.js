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
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../firebase/config';

/* =========================
   Utils
   ========================= */

const generateGroupCode = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  return Array.from({ length: 6 }, () =>
    chars[Math.floor(Math.random() * chars.length)]
  ).join('');
};

const extractUserData = (user) => ({
  uid: user.uid,
  displayName:
    user.displayName || user.email?.split('@')[0] || 'User',
  email: user.email,
});

/* =========================
   Group CRUD
   ========================= */

export const createGroup = async (name, description, createdBy) => {
  const groupCode = generateGroupCode();
  const user = extractUserData(createdBy);

  const groupData = {
    name,
    description,
    groupCode,
    createdBy: user,
    members: [user.uid],
    memberDetails: [
      {
        ...user,
        joinedAt: new Date().toISOString(),
      },
    ],
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  const docRef = await addDoc(collection(db, 'groups'), groupData);

  await updateDoc(doc(db, 'users', user.uid), {
    groups: arrayUnion(docRef.id),
  });

  return { id: docRef.id, ...groupData };
};

export const getGroup = async (groupId) => {
  const snap = await getDoc(doc(db, 'groups', groupId));
  if (!snap.exists()) throw new Error('Group not found');
  return { id: snap.id, ...snap.data() };
};

/* =========================
   Expenses
   ========================= */

const fetchGroupExpenses = async (groupId) => {
  const q = query(
    collection(db, 'expenses'),
    where('groupId', '==', groupId)
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
};

export const addExpense = async (groupId, expenseData) => {
  const expense = {
    ...expenseData,
    groupId,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  const ref = await addDoc(collection(db, 'expenses'), expense);
  return { id: ref.id, ...expense };
};

export const getGroupExpenses = (groupId, callback) => {
  const q = query(
    collection(db, 'expenses'),
    where('groupId', '==', groupId),
    orderBy('createdAt', 'desc')
  );

  return onSnapshot(q, (snapshot) => {
    callback(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
  });
};

/* =========================
   User Groups
   ========================= */

export const getUserGroups = async (userId) => {
  const userSnap = await getDoc(doc(db, 'users', userId));
  const groupIds = userSnap.data()?.groups || [];

  const groups = await Promise.all(
    groupIds.map(async (groupId) => {
      try {
        const group = await getGroup(groupId);
        const expenses = await fetchGroupExpenses(groupId);
        const members =
          group.memberDetails ||
          group.members.map(uid => ({ uid }));

        return {
          ...group,
          balances: calculateBalances(expenses, members),
        };
      } catch (err) {
        console.error(`Error loading group ${groupId}`, err);
        return null;
      }
    })
  );

  return groups
    .filter(Boolean)
    .sort((a, b) => {
      const aDate = a.createdAt?.toDate?.() || new Date(0);
      const bDate = b.createdAt?.toDate?.() || new Date(0);
      return bDate - aDate;
    });
};

/* =========================
   Join / Leave Group
   ========================= */

export const joinGroup = async (groupCode, user) => {
  const q = query(
    collection(db, 'groups'),
    where('groupCode', '==', groupCode)
  );

  const snapshot = await getDocs(q);
  if (snapshot.empty) throw new Error('Invalid group code');

  const groupDoc = snapshot.docs[0];
  const group = groupDoc.data();

  if (group.members.includes(user.uid)) {
    throw new Error('You are already a member of this group');
  }

  const userData = extractUserData(user);

  await updateDoc(groupDoc.ref, {
    members: arrayUnion(user.uid),
    memberDetails: arrayUnion({
      ...userData,
      joinedAt: new Date().toISOString(),
    }),
    updatedAt: serverTimestamp(),
  });

  await updateDoc(doc(db, 'users', user.uid), {
    groups: arrayUnion(groupDoc.id),
  });

  return { id: groupDoc.id, ...group };
};

export const leaveGroup = async (groupId, userId) => {
  const groupRef = doc(db, 'groups', groupId);
  const snap = await getDoc(groupRef);

  if (!snap.exists()) return;

  const data = snap.data();

  const updatedMembers = data.members.filter(uid => uid !== userId);
  const updatedDetails = data.memberDetails.filter(
    m => m.uid !== userId
  );

  await updateDoc(groupRef, {
    members: updatedMembers,
    memberDetails: updatedDetails,
    updatedAt: serverTimestamp(),
  });

  await updateDoc(doc(db, 'users', userId), {
    groups: arrayRemove(groupId),
  });
};

/* =========================
   Realtime
   ========================= */

export const subscribeToGroup = (groupId, callback) => {
  return onSnapshot(doc(db, 'groups', groupId), (snap) => {
    callback(snap.exists() ? { id: snap.id, ...snap.data() } : null);
  });
};

/* =========================
   Balance Calculation
   ========================= */

export const calculateBalances = (expenses, members) => {
  const balances = {};
  const memberIds = members.map(m => m.uid);

  memberIds.forEach(id => (balances[id] = 0));

  expenses.forEach(({ amount, payerId }) => {
    const value = parseFloat(amount);
    const share = value / memberIds.length;

    balances[payerId] += value;
    memberIds.forEach(id => (balances[id] -= share));
  });

  return balances;
};
