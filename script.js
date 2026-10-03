let globalAppProperties = {
  examData: null,
  summaryData: null,
  currentExamKey: 'm_junior',
  currentSummaryKey: 'm_junior'
};

// ----------------------------------------------------
// ฟังก์ชันดึงข้อมูลจากไฟล์ data.json
// ----------------------------------------------------
async function loadAppData() {
  try {
    const response = await fetch('data.json');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    globalAppProperties.examData = data.examData;
    globalAppProperties.summaryData = data.summaryData;

    // เมื่อดึงข้อมูลเสร็จสั่ง Render หน้าจอ
    renderExamContent(globalAppProperties.currentExamKey);
    renderSummaryContent(globalAppProperties.currentSummaryKey);
  } catch (error) {
    console.error("ไม่สามารถโหลดไฟล์ data.json ได้:", error);
  }
}

// ----------------------------------------------------
// ระบบ Navigation & Page Switching
// ----------------------------------------------------
function showPage(pageId) {
  document.querySelectorAll('.page').forEach(page => {
    page.classList.remove('active');
  });
  const targetPage = document.getElementById(pageId);
  if (targetPage) targetPage.classList.add('active');

  document.querySelectorAll('.nav-item').forEach(item => {
    item.classList.remove('active');
  });

  const activeNav = document.getElementById('nav-' + pageId);
  if (activeNav) activeNav.classList.add('active');

  const mobNav = document.getElementById('mob-' + pageId);
  if (mobNav) mobNav.classList.add('active');

  const drawer = document.getElementById('mobileDrawer');
  if (drawer) drawer.classList.remove('show');
}

function toggleMobileNav(e) {
  if (e) e.stopPropagation();
  const drawer = document.getElementById('mobileDrawer');
  if (drawer) drawer.classList.toggle('show');
}

// ----------------------------------------------------
// ระบบแสดงผลคลังข้อสอบ
// ----------------------------------------------------
function renderExamContent(key) {
  if (!globalAppProperties.examData) return;
  const container = document.querySelector('#page3 .exam-wrapper');
  if (!container) return;

  const cardTitle = container.querySelector('.exam-card-title');
  const cardSubtitle = container.querySelector('.exam-card-subtitle');
  const examGrid = container.querySelector('.exam-grid');

  const data = globalAppProperties.examData[key];
  if (!data) return;

  if (cardTitle) cardTitle.textContent = data.title;
  if (cardSubtitle) cardSubtitle.textContent = data.subtitle;

  if (examGrid) {
    examGrid.innerHTML = data.items.map(item => `
      <div class="exam-item-card" onclick="window.open('${item.link}', '_blank')">
        <div style="display: flex; justify-content: space-between; align-items: flex-start;">
          <div class="exam-item-name">${item.name}</div>
          <span style="font-size: 0.9rem; opacity: 0.7;">↗</span>
        </div>
        <div class="exam-item-meta">${item.meta}</div>
      </div>
    `).join('');
  }
}

function setupExamPills() {
  const container = document.querySelector('#page3 .exam-wrapper');
  if (!container) return;

  const buttons = container.querySelectorAll('.exam-pill-btn');
  const keys = ['m_junior', 'm_senior', 'extra'];

  buttons.forEach((btn, index) => {
    btn.addEventListener('click', () => {
      buttons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      globalAppProperties.currentExamKey = keys[index];
      renderExamContent(keys[index]);
    });
  });
}

// ----------------------------------------------------
// ระบบแสดงผลสรุปคณิตศาสตร์
// ----------------------------------------------------
function renderSummaryContent(key) {
  if (!globalAppProperties.summaryData) return;
  const cardsContainer = document.getElementById('summary-cards-list');
  if (!cardsContainer) return;

  // Helper สำหรับสร้าง HTML แต่ละแถวรายการ
  const createRowsHTML = (items) => {
    if (!items || items.length === 0) {
      return `<div style="text-align: center; color: rgba(0,0,0,0.5); padding: 10px 0;">ยังไม่มีข้อมูลในหมวดนี้</div>`;
    }
    return items.map(item => `
      <div class="summary-item-row">
        <div class="card-topic">${item.chapter}</div>
        <a class="download-link" href="${item.link}" target="_blank">Download</a>
      </div>
    `).join('');
  };



  // 👈 กรณีที่ 1: ถ้ากดปุ่ม "หนังสือเรียน" (textbook) -> แสดงผล 2 การ์ดแยก ม.ต้น / ม.ปลาย
  // กรณีที่กดปุ่ม "หนังสือเรียน" (textbook)
  if (key === 'textbook') {
    const textbookData = globalAppProperties.summaryData.textbook || {};
    const mJuniorBooks = textbookData.m_junior || [];
    const mSeniorBooks = textbookData.m_senior || [];

    cardsContainer.innerHTML = `
      <div class="textbook-grid">
        <!-- การ์ดซ้าย: หนังสือเรียน ม.ต้น -->
        <div class="glass-card summary-list-card">
          <h3 class="card-section-title">📚 หนังสือเรียน ม.ต้น</h3>
          ${createRowsHTML(mJuniorBooks)}
        </div>

        <!-- การ์ดขวา: หนังสือเรียน ม.ปลาย -->
        <div class="glass-card summary-list-card">
          <h3 class="card-section-title">📚 หนังสือเรียน ม.ปลาย</h3>
          ${createRowsHTML(mSeniorBooks)}
        </div>
      </div>
    `;
    return;
  }

  // 👈 กรณีที่ 2: ปุ่มอื่นๆ (ม.ต้น, ม.ปลาย, เพิ่มเติม) -> แสดงผลการ์ดใบเดียวตามปกติ
  const items = globalAppProperties.summaryData[key];

  if (!items || items.length === 0) {
    cardsContainer.innerHTML = `
      <div class="glass-card summary-list-card">
        <div style="text-align: center; color: rgba(0,0,0,0.5); padding: 20px;">ยังไม่มีข้อมูลในหมวดนี้</div>
      </div>
    `;
    return;
  }

  cardsContainer.innerHTML = `
    <div class="glass-card summary-list-card">
      ${createRowsHTML(items)}
    </div>
  `;
}


function setupSummaryPills() {
  const container = document.querySelector('#page2 .app-container');
  if (!container) return;

  const buttons = container.querySelectorAll('.pill-btn');
  const keys = ['m_junior', 'm_senior', 'extra', 'textbook'];

  buttons.forEach((btn, index) => {
    btn.addEventListener('click', () => {
      buttons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      globalAppProperties.currentSummaryKey = keys[index];
      renderSummaryContent(keys[index]);
    });
  });
}

// ----------------------------------------------------
// Event Listener เมื่อเปิดหน้าเว็บ
// ----------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
  setupExamPills();
  setupSummaryPills();

  // โหลดข้อมูลจาก data.json
  loadAppData();

  document.addEventListener('click', (e) => {
    const drawer = document.getElementById('mobileDrawer');
    if (drawer && drawer.classList.contains('show')) {
      if (!drawer.contains(e.target) && !e.target.classList.contains('hamburger-btn')) {
        drawer.classList.remove('show');
      }
    }
  });

  // Render KaTeX Math Expressions
  if (typeof katex !== 'undefined') {
    const math1 = document.getElementById('math1');
    const math2 = document.getElementById('math2');
    const mathEq = document.getElementById('mathEq');
    const math3 = document.getElementById('math3');

    if (math1) katex.render("a, b", math1);
    if (math2) katex.render("a > b", math2);
    if (mathEq) katex.render("10 = |2x + 3 + |x^2 - 3x + 5||", mathEq, { displayMode: true });
    if (math3) katex.render("a^2 + ab + 2b", math3);
  }
});

// Background Particle Network Canvas
const canvas = document.getElementById('networkCanvas');
if (canvas) {
  const ctx = canvas.getContext('2d');
  let particles = [];
  const particleCount = 40;
  const maxDistance = 150;

  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();

  class Particle {
    constructor() {
      this.x = Math.random() * canvas.width;
      this.y = Math.random() * canvas.height;
      this.vx = (Math.random() - 0.5) * 0.6;
      this.vy = (Math.random() - 0.5) * 0.6;
      this.radius = Math.random() * 2 + 1;
    }

    update() {
      this.x += this.vx;
      this.y += this.vy;

      if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
      if (this.y < 0 || this.y > canvas.height) this.vy *= -1;
    }

    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(139, 92, 246, 0.45)';
      ctx.fill();
    }
  }

  for (let i = 0; i < particleCount; i++) {
    particles.push(new Particle());
  }

  function animateNetwork() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < particles.length; i++) {
      particles[i].update();
      particles[i].draw();

      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < maxDistance) {
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(168, 85, 247, ${0.4 * (1 - dist / maxDistance)})`;
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }
      }
    }
    requestAnimationFrame(animateNetwork);
  }

  animateNetwork();
}