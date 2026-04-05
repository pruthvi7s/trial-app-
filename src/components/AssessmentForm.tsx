import { useState } from 'react';
import { motion } from 'motion/react';
import { db, auth } from '../lib/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { suggestCareerPaths } from '../services/aiService';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export default function AssessmentForm() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    education: '',
    riasec: { R: 5, I: 5, A: 5, S: 5, E: 5, C: 5 },
    mbti: 'INTJ',
    skills: ''
  });
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [roadmap, setRoadmap] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (auth.currentUser) {
      setLoading(true);
      try {
        const paths = await suggestCareerPaths(formData);
        setSuggestions(paths);
        await setDoc(doc(db, 'assessments', auth.currentUser.uid), {
          ...formData,
          studentId: auth.currentUser.uid,
          careerPaths: paths,
          status: 'pending'
        });
        setStep(5);
      } catch (error) {
        console.error('Submission failed', error);
        alert('Failed to submit assessment. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  };

  const downloadPDF = () => {
    const input = document.getElementById('results');
    if (input) {
      html2canvas(input).then((canvas) => {
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF();
        pdf.addImage(imgData, 'PNG', 0, 0, 200, 100);
        pdf.save('career-results.pdf');
      });
    }
  };

  const generateRoadmap = async (careerPath: string) => {
    const roadmap = await import('../services/aiService').then(s => s.generateLearningRoadmap(careerPath));
    setRoadmap(roadmap || '');
  };

  return (
    <div className="p-6 bg-dark-grey rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-gold mb-4">Assessment Step {step}</h2>
      {step === 1 && (
        <div className="space-y-4">
          <input 
            type="text" 
            placeholder="Full Name" 
            className="w-full p-2 bg-black border border-gold rounded"
            onChange={(e) => setFormData({...formData, name: e.target.value})}
          />
          <button onClick={() => setStep(2)} className="bg-gold text-black px-4 py-2 rounded">Next</button>
        </div>
      )}
      {step === 2 && (
        <div className="space-y-4">
          <p className="text-white">Enter your RIASEC scores (1-10):</p>
          {['R', 'I', 'A', 'S', 'E', 'C'].map(cat => (
            <div key={cat} className="flex items-center gap-2">
              <label className="text-gold w-8">{cat}</label>
              <input 
                type="number" 
                min="1" max="10"
                className="p-2 bg-black border border-gold rounded w-20"
                value={formData.riasec[cat as keyof typeof formData.riasec]}
                onChange={(e) => setFormData({
                  ...formData, 
                  riasec: { ...formData.riasec, [cat]: parseInt(e.target.value) }
                })}
              />
            </div>
          ))}
          <button onClick={() => setStep(3)} className="bg-gold text-black px-4 py-2 rounded">Next</button>
        </div>
      )}
      {step === 3 && (
        <div className="space-y-4">
          <p className="text-white">List your Skills and Values (e.g., Teamwork, Creativity):</p>
          <textarea 
            placeholder="e.g., Teamwork, Creativity, Problem Solving" 
            className="w-full p-2 bg-black border border-gold rounded"
            value={formData.skills}
            onChange={(e) => setFormData({...formData, skills: e.target.value})}
          />
          <button onClick={() => setStep(4)} className="bg-gold text-black px-4 py-2 rounded">Next</button>
        </div>
      )}
      {step === 4 && (
        <div className="space-y-4">
          <p className="text-white">Enter your MBTI Personality Type (e.g., INTJ, ENFP):</p>
          <input 
            type="text" 
            placeholder="e.g., INTJ" 
            className="w-full p-2 bg-black border border-gold rounded"
            value={formData.mbti}
            onChange={(e) => setFormData({...formData, mbti: e.target.value.toUpperCase()})}
          />
          <button 
            onClick={handleSubmit} 
            disabled={loading}
            className="bg-gold text-black px-4 py-2 rounded disabled:opacity-50"
          >
            {loading ? 'Analyzing your profile...' : 'Submit Assessment'}
          </button>
        </div>
      )}
      {step === 5 && (
        <div id="results" className="space-y-4">
          <h3 className="text-xl text-gold">Suggested Career Paths:</h3>
          {suggestions.map((s, i) => (
            <div key={i} className="p-4 border border-gold rounded cursor-pointer" onClick={() => generateRoadmap(s.title)}>
              <h4 className="font-bold">{s.title}</h4>
              <p>{s.description}</p>
            </div>
          ))}
          {roadmap && (
            <div className="p-4 border border-gold rounded mt-4">
              <h4 className="font-bold text-gold">Learning Roadmap:</h4>
              <pre className="whitespace-pre-wrap">{roadmap}</pre>
            </div>
          )}
          <button onClick={downloadPDF} className="bg-gold text-black px-4 py-2 rounded">Download PDF</button>
        </div>
      )}
    </div>
  );
}
