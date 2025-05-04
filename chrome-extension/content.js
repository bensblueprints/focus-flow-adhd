// Create overlay div
const overlay = document.createElement('div');
overlay.id = 'focusflow-overlay';
overlay.style.position = 'fixed';
overlay.style.bottom = '40px';
overlay.style.right = '40px';
overlay.style.width = '350px';
overlay.style.height = '500px';
overlay.style.background = 'white';
overlay.style.border = '2px solid #6366f1';
overlay.style.borderRadius = '16px';
overlay.style.boxShadow = '0 4px 24px rgba(0,0,0,0.18)';
overlay.style.zIndex = '999999';
overlay.style.display = 'flex';
overlay.style.flexDirection = 'column';
overlay.style.resize = 'both';
overlay.style.overflow = 'auto';
overlay.style.cursor = 'move';
overlay.style.userSelect = 'none';
overlay.style.transition = 'box-shadow 0.2s';
overlay.innerHTML = `
  <div style="padding: 12px; font-weight: bold; color: #6366f1; cursor: move; background: #f1f5f9; border-bottom: 1px solid #e0e7ef; border-radius: 16px 16px 0 0;">FocusFlow ADHD Tracker <span style='float:right;cursor:pointer;color:#888;' id='focusflow-close'>&times;</span></div>
  <div style="flex:1;display:flex;align-items:center;justify-content:center;color:#6366f1;font-size:1.1em;">(Your tracker UI will appear here)</div>
`;
document.body.appendChild(overlay);

// Drag logic
let isDragging = false;
let offsetX, offsetY;
const header = overlay.firstChild;
header.addEventListener('mousedown', (e) => {
  isDragging = true;
  offsetX = e.clientX - overlay.getBoundingClientRect().left;
  offsetY = e.clientY - overlay.getBoundingClientRect().top;
  document.body.style.userSelect = 'none';
});
document.addEventListener('mousemove', (e) => {
  if (!isDragging) return;
  overlay.style.left = (e.clientX - offsetX) + 'px';
  overlay.style.top = (e.clientY - offsetY) + 'px';
  overlay.style.right = '';
  overlay.style.bottom = '';
});
document.addEventListener('mouseup', () => {
  isDragging = false;
  document.body.style.userSelect = '';
});
// Close button
const closeBtn = document.getElementById('focusflow-close');
closeBtn.addEventListener('click', () => overlay.remove()); 