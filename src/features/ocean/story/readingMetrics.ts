// scrollHeight/clientHeight are integers; scrollTop and the browser's actual
// scroll limit can be fractional, especially at non-integer browser zoom.
// Share the same tolerance between the progress UI and gesture navigation.
const EDGE_TOLERANCE=2;

export function readingMetrics(reader:Pick<HTMLElement,'scrollHeight'|'clientHeight'|'scrollTop'>){
  const maximum=Math.max(0,reader.scrollHeight-reader.clientHeight);
  const overflow=maximum>EDGE_TOLERANCE;
  const atStart=reader.scrollTop<=EDGE_TOLERANCE;
  const atEnd=!overflow||maximum-reader.scrollTop<=EDGE_TOLERANCE;
  return {maximum,overflow,atStart,atEnd,progress:atEnd?1:Math.max(0,reader.scrollTop/maximum)};
}
