export function initLupa(container, lupaContainer) {
  container.addEventListener('mouseover', (e) => {
    const img = e.target.closest('img');
    if (img && container.contains(img)) {
      lupaContainer.innerHTML = '';

      const zoomImg = document.createElement('img');
      zoomImg.src = img.src;
      zoomImg.alt = img.alt;
      zoomImg.style.width = '300px';
      zoomImg.style.height = '300px';
      zoomImg.style.objectFit = 'contain';

      lupaContainer.appendChild(zoomImg);
      lupaContainer.style.display = 'block';
    }
  });

  container.addEventListener('mousemove', (e) => {
    lupaContainer.style.left = e.pageX + 20 + 'px';
    lupaContainer.style.top = e.pageY + 20 + 'px';
  });

  container.addEventListener('mouseout', (e) => {
    const related = e.relatedTarget;
    if (!container.contains(related)) {
      lupaContainer.style.display = 'none';
    }
  });
}
