// Remove existing overlay if present
const existing = document.getElementById('focusflow-overlay');
if (existing) existing.remove();

// Create overlay div
const overlay = document.createElement('div');
overlay.id = 'focusflow-overlay';
overlay.style.position = 'fixed';
overlay.style.left = '';
overlay.style.top = '';
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
overlay.style.overflow = 'hidden';
overlay.style.userSelect = 'none';
overlay.style.transition = 'box-shadow 0.2s';

overlay.innerHTML = `
  <div id="focusflow-header" style="padding: 12px; font-weight: bold; color: #6366f1; cursor: move; background: #f1f5f9; border-bottom: 1px solid #e0e7ef; border-radius: 16px 16px 0 0; display: flex; justify-content: space-between; align-items: center;">
    <span>FocusFlow ADHD Tracker</span>
    <span style='cursor:pointer;color:#888;font-size:1.5em;' id='focusflow-close'>&times;</span>
  </div>
  <iframe id="focusflow-iframe" src="http://localhost:5173/overlay.html" style="flex:1;border:none;width:100%;height:100%;border-radius:0 0 16px 16px;background:#f8fafc;"></iframe>
`;
document.body.appendChild(overlay);

// Drag logic
let isDragging = false;
let offsetX, offsetY;
const header = document.getElementById('focusflow-header');
const iframe = document.getElementById('focusflow-iframe');
let dragOverlay = null;

header.addEventListener('mousedown', (e) => {
  isDragging = true;
  const rect = overlay.getBoundingClientRect();
  offsetX = e.clientX - rect.left;
  offsetY = e.clientY - rect.top;
  overlay.style.left = rect.left + 'px';
  overlay.style.top = rect.top + 'px';
  overlay.style.right = '';
  overlay.style.bottom = '';
  overlay.style.transition = 'none';
  // Prevent pointer events on iframe while dragging
  if (iframe) iframe.style.pointerEvents = 'none';
  // Add a transparent overlay to capture mouse events
  dragOverlay = document.createElement('div');
  dragOverlay.style.position = 'fixed';
  dragOverlay.style.left = '0';
  dragOverlay.style.top = '0';
  dragOverlay.style.width = '100vw';
  dragOverlay.style.height = '100vh';
  dragOverlay.style.zIndex = '1000000';
  dragOverlay.style.cursor = 'move';
  dragOverlay.style.background = 'rgba(0,0,0,0)';
  document.body.appendChild(dragOverlay);
});

document.addEventListener('mousemove', (e) => {
  if (!isDragging) return;
  overlay.style.left = (e.clientX - offsetX) + 'px';
  overlay.style.top = (e.clientY - offsetY) + 'px';
  overlay.style.right = '';
  overlay.style.bottom = '';
});

document.addEventListener('mouseup', () => {
  if (!isDragging) return;
  isDragging = false;
  overlay.style.transition = 'box-shadow 0.2s';
  if (iframe) iframe.style.pointerEvents = '';
  if (dragOverlay) {
    document.body.removeChild(dragOverlay);
    dragOverlay = null;
  }
});
// Close button
const closeBtn = document.getElementById('focusflow-close');
closeBtn.addEventListener('click', () => overlay.remove()); 