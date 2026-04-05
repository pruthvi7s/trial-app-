import { useEffect, useState } from 'react';
import { db } from '../lib/firebase';
import { collection, getDocs, updateDoc, doc } from 'firebase/firestore';

export default function AdminDashboard() {
  const [assessments, setAssessments] = useState<any[]>([]);

  useEffect(() => {
    const fetchAssessments = async () => {
      const snapshot = await getDocs(collection(db, 'assessments'));
      setAssessments(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    };
    fetchAssessments();
  }, []);

  const markAsViewed = async (id: string) => {
    await updateDoc(doc(db, 'assessments', id), { status: 'viewed' });
    setAssessments(assessments.map(a => a.id === id ? { ...a, status: 'viewed' } : a));
  };

  return (
    <div className="p-6 bg-dark-grey rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-gold mb-4">Admin Dashboard</h2>
      <table className="w-full text-white">
        <thead>
          <tr>
            <th>Student</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {assessments.map(a => (
            <tr key={a.id}>
              <td>{a.name}</td>
              <td>{a.status}</td>
              <td>
                {a.status === 'pending' && (
                  <button onClick={() => markAsViewed(a.id)} className="bg-gold text-black px-2 py-1 rounded">Mark Viewed</button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
