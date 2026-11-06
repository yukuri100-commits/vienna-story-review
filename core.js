const QuizCore = (() => {
  const ids = QUESTIONS.map(q => q.id);
  function create(questionIds = ids, random = false) {
    const order = [...questionIds];
    if (random) for (let i = order.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [order[i], order[j]] = [order[j], order[i]]; }
    return {version:1,order,index:0,answers:{},phase:'quiz',mode:order.length === 16 ? 'all' : 'retry'};
  }
  function current(s) { return QUESTIONS.find(q => q.id === s.order[s.index]); }
  function select(s, choice) {const q=current(s); if(s.phase!=='quiz'||!q||s.answers[q.id]?.checked||!Number.isInteger(choice)||choice<0||choice>3)return false;s.answers[q.id]={choice,checked:false};return true;}
  function check(s) {const q=current(s),a=s.answers[q?.id];if(s.phase!=='quiz'||!a||a.checked)return false;a.checked=true;return true;}
  function next(s) {const q=current(s);if(s.phase!=='quiz'||!s.answers[q?.id]?.checked)return false;if(s.index<s.order.length-1)s.index++;else s.phase='results';return true;}
  function correct(s) {return s.order.filter(id=>{const a=s.answers[id],q=QUESTIONS.find(q=>q.id===id);return a?.checked&&a.choice===q.answer;}).length;}
  function answered(s) {return s.order.filter(id=>s.answers[id]?.checked).length;}
  function missed(s) {return s.order.filter(id=>{const a=s.answers[id];return a?.checked&&a.choice!==QUESTIONS.find(q=>q.id===id).answer;});}
  function valid(s) {
    if(!s||s.version!==1||!Array.isArray(s.order)||!s.order.length||s.order.length>16||new Set(s.order).size!==s.order.length||s.order.some(id=>!ids.includes(id))||!Number.isInteger(s.index)||s.index<0||s.index>=s.order.length||!['quiz','results'].includes(s.phase)||!['all','retry'].includes(s.mode)||!s.answers||typeof s.answers!=='object'||Array.isArray(s.answers))return false;
    for(const key of Object.keys(s.answers)){const a=s.answers[key];if(!s.order.includes(Number(key))||!a||!Number.isInteger(a.choice)||a.choice<0||a.choice>3||typeof a.checked!=='boolean')return false;}
    if(s.order.slice(0,s.index).some(id=>!s.answers[id]?.checked))return false;
    if(s.order.slice(s.index+1).some(id=>s.answers[id]))return false;
    if(s.phase==='results'&&(s.index!==s.order.length-1||answered(s)!==s.order.length))return false;
    return true;
  }
  return {create,current,select,check,next,correct,answered,missed,valid};
})();
