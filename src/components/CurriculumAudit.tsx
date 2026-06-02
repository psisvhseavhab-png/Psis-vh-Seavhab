import React from 'react';
import { Book, Target, Award, ListChecks, CheckCircle2 } from 'lucide-react';

export function CurriculumAudit() {
  const primarySubjects = [
    { name: "Art-Drawing", lang: "Khmer" },
    { name: "Art-Music", lang: "Khmer" },
    { name: "Computer", lang: "English" },
    { name: "English for communication", lang: "English" },
    { name: "Core English", lang: "English" },
    { name: "Mathematics", lang: "English" },
    { name: "Health Education", lang: "English" },
    { name: "Social Study", lang: "English" },
    { name: "Science", lang: "English" },
    { name: "Khmer Language", lang: "Khmer" },
    { name: "Library", lang: "English" },
    { name: "Mathematics", lang: "Khmer" },
    { name: "Physical Education", lang: "English" },
    { name: "Science/ Social", lang: "Khmer" },
    { name: "Local Life Skills Program", lang: "Khmer" },
  ];

  const seniorSubjects = [
    { name: "English", lang: "English" },
    { name: "Mathematics", lang: "English" },
    { name: "Physics", lang: "English" },
    { name: "Chemistry", lang: "English" },
    { name: "Biology", lang: "English" },
    { name: "Computer", lang: "English" },
    { name: "Earth/Environmental Science", lang: "English" },
    { name: "Character Building and Leadership", lang: "English" },
    { name: "Home Economics", lang: "Khmer" },
    { name: "Geography", lang: "Khmer" },
    { name: "Khmer Literature", lang: "Khmer" },
    { name: "History", lang: "Khmer" },
    { name: "Morality and Civic Education", lang: "Khmer" },
    { name: "Fine Art and Music", lang: "Khmer" },
    { name: "Physical / Health Education", lang: "Khmer" },
    { name: "Local Life Skills Program", lang: "Khmer" },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-900 italic uppercase">Curriculum Audit</h1>
          <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest mt-1">Official PSIS-VH Program Guidelines</p>
        </div>
        <div className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-blue-500/20">
          Academic Year 2024-2025
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Kindergarten Card */}
        <div className="xl:col-span-3">
          <div className="bg-white rounded-[2.5rem] border border-emerald-200 overflow-hidden shadow-sm">
            <div className="p-8 bg-emerald-600 text-white flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md">
                  <CheckCircle2 size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-black italic uppercase">Kindergarten Program</h2>
                  <p className="text-emerald-100 text-[10px] font-black uppercase tracking-widest">Ages 1y - 6y • Foundation Years</p>
                </div>
              </div>
              <div className="px-6 py-2 bg-white/20 rounded-full text-[10px] font-black uppercase italic">Play-Based Learning</div>
            </div>
            <div className="p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-4">
                <h4 className="text-sm font-black text-slate-900 uppercase italic">Educational Philosophy</h4>
                <p className="text-slate-500 font-bold text-xs leading-relaxed">
                  The purpose of the program is to establish a strong foundation for learning in the early years. Our safe and caring environment promotes physical, social, emotional, and cognitive development through a play-based approach, fostering connection with the world around them.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                  {[
                    "Language & Literacy extension",
                    "Social & Cultural understanding",
                    "Expressing thoughts & feelings",
                    "Real-world problem solving",
                    "Critical and creative thinking",
                    "Safe Stimulating Environment"
                  ].map((benefit, i) => (
                    <div key={i} className="flex items-center gap-2 p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                      <CheckCircle2 size={14} className="text-emerald-600" />
                      <span className="text-[10px] font-black text-emerald-900 uppercase italic">{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 space-y-4">
                 <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Key Components</h5>
                 <div className="space-y-3">
                    {["Space", "Time", "Resources", "Well-planned Play"].map(key => (
                      <div key={key} className="flex items-center justify-between">
                         <span className="text-xs font-black text-slate-700 italic uppercase">{key}</span>
                         <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      </div>
                    ))}
                 </div>
                 <div className="pt-4 mt-4 border-t border-slate-200">
                    <p className="text-[10px] font-bold text-slate-400 italic">Play is the foundation of all language learning experiences.</p>
                 </div>
              </div>
            </div>
          </div>
        </div>

        {/* Primary Curriculum Card */}
        <div className="xl:col-span-2 space-y-6">
          <div className="bg-white rounded-[2.5rem] border border-slate-200 overflow-hidden shadow-sm">
            <div className="p-8 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <Book size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-black italic uppercase">Primary Curriculum</h2>
                  <p className="text-blue-400 text-[10px] font-black uppercase tracking-widest">Grades 1 - 6</p>
                </div>
              </div>
              <div className="px-4 py-2 border border-white/20 rounded-full text-[10px] font-black uppercase">15 Subjects</div>
            </div>
            
            <div className="p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {primarySubjects.map((s, i) => (
                <div key={i} className="group p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-blue-200 hover:bg-blue-50 transition-all">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-black text-slate-400 group-hover:text-blue-400">#{i + 1}</span>
                    <span className={`text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest ${s.lang === 'English' ? 'bg-blue-100 text-blue-600' : 'bg-emerald-100 text-emerald-600'}`}>
                      {s.lang}
                    </span>
                  </div>
                  <p className="text-sm font-black text-slate-700 italic uppercase leading-tight group-hover:text-slate-900 transition-colors">
                    {s.name}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-[2.5rem] border border-slate-200 overflow-hidden shadow-sm">
            <div className="p-8 bg-blue-600 text-white">
              <div className="flex items-center gap-4 mb-2">
                <Target size={24} />
                <h2 className="text-xl font-black italic uppercase">Academic Aims</h2>
              </div>
              <p className="text-blue-100 text-xs font-bold">Standardized objectives for PSIS VH excellence</p>
            </div>
            <div className="p-8 space-y-6">
              {[
                { title: "Art & Music", desc: "Nurture confidence, self-esteem, and potential through techniques and creative skills." },
                { title: "Language Proficiency", desc: "Maintain interest in Khmer and English; develop cognitive ability and listening/speaking confidence." },
                { title: "Personal Health", desc: "Foster respect, appreciation of dignity, and foundation for healthy living and citizenship." },
                { title: "Science & Tech", desc: "Explore human, natural, and physical environments through scientific approaches." },
                { title: "Mathematics", desc: "Effective and accurate use of mathematical language in both Khmer and English." }
              ].map((aim, i) => (
                <div key={i} className="flex gap-4">
                  <div className="shrink-0 w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 font-black text-xs">0{i+1}</div>
                  <div>
                    <h5 className="font-black text-slate-900 uppercase italic text-sm mb-1">{aim.title}</h5>
                    <p className="text-slate-500 text-xs font-bold leading-relaxed">{aim.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Secondary Curriculum Card */}
        <div className="space-y-6">
          <div className="bg-white rounded-[2.5rem] border border-slate-200 overflow-hidden shadow-sm sticky top-24">
            <div className="p-8 bg-slate-900 text-white border-b border-white/10">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <Award size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-black italic uppercase text-wrap">Junior & Senior High</h2>
                  <p className="text-purple-400 text-[10px] font-black uppercase tracking-widest">Grades 7 - 12</p>
                </div>
              </div>
            </div>
            
            <div className="p-8 space-y-4 max-h-[600px] overflow-y-auto custom-scrollbar">
              <div className="mb-6 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Academic Orientation</h5>
                <p className="text-xs font-bold text-slate-600 leading-relaxed uppercase italic">
                  College Preparatory Curriculum & NIB Pathway
                </p>
              </div>
              {seniorSubjects.map((s, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-white border border-slate-100 rounded-xl hover:bg-slate-50 transition-all">
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-black text-slate-300 w-4">{i + 1}</span>
                    <span className="text-xs font-black text-slate-700 uppercase italic">{s.name}</span>
                  </div>
                  <span className={`text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest ${s.lang === 'English' ? 'text-blue-500' : 'text-emerald-500'}`}>
                    {s.lang}
                  </span>
                </div>
              ))}
            </div>
            
            <div className="p-8 border-t border-slate-100 bg-slate-50/50">
               <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Core Focus Areas</h5>
               <div className="space-y-4">
                  {[
                    { label: "Language Arts", val: "Comprehension & Coursework" },
                    { label: "Advanced Math", val: "Geometry & Calculus" },
                    { label: "Computer Tech", val: "Programming & Literacy" }
                  ].map((focus, i) => (
                    <div key={i} className="flex items-center justify-between">
                       <span className="text-[10px] font-black text-slate-900 uppercase italic">{focus.label}</span>
                       <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">{focus.val}</span>
                    </div>
                  ))}
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
