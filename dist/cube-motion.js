// A conceptual research trajectory: an experiment, a dead end, then a new direction.
export const route = [[0,0,3],[1,0,3],[1,1,3],[1,1,2],[2,1,2],[2,2,2],[2,2,1],[3,2,1],[3,3,1],[3,3,0]];
export const branch = [[1,1,3],[0,1,3],[0,2,3]];
const smooth = x => { const n=Math.max(0,Math.min(1,x));return n*n*(3-2*n); };
export function frameState(time,still=false) {
  if(still)return {spread:1.1,progress:9,branch:0,opacity:1};
  const t=time%17;
  const open=smooth(t/3.5)*(1-smooth((t-11)/3.5));
  const progress=t<4.8?1+smooth(t/2)*1:2+smooth((t-4.8)/6.5)*7;
  const attempted=t<3.6?smooth((t-2)/1.6)*2:(1-smooth((t-3.6)/1.2))*2;
  return {spread:1+open*.11,progress,branch:attempted,opacity:smooth(t/.7)*(1-smooth((t-15.8)/1.2))};
}
