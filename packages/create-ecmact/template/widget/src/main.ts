import './styles.css';
import './widget';

document.addEventListener('add', (event) => {
  const { quantity, total } = (event as CustomEvent<{ quantity: number; total: string }>).detail;
  const log = document.querySelector('#log');
  if (log) log.textContent = `add: ${quantity} x, ${total}`;
});
