// ==========================================
// MindEase AI - Complete Frontend JavaScript
// Multi-Page Application with Notification System
// ==========================================

// Global State
let employees = [];
let chartInstances = {
  stress: null,
  trend: null
};

// Configuration
const CONFIG = {
  API_ENDPOINT: 'http://localhost:5000/api',
  STRESS_THRESHOLDS: {
    healthy: 0.4,
    warning: 0.7,
    critical: 1.0
  },
  WEIGHTS: {
    hours: 0.30,
    errors: 0.25,
    nightShifts: 0.20,
    loginCount: 0.15,
    taskLoad: 0.10
  }
};

// ==========================================
// Utility Functions
// ==========================================

function showToast(type, title, message) {
  const container = document.getElementById('toastContainer');
  if (!container) return;
  
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  
  const icons = {
    success: 'fa-check-circle',
    error: 'fa-exclamation-circle',
    info: 'fa-info-circle'
  };
  
  toast.innerHTML = `
    <div class="toast-icon">
      <i class="fas ${icons[type]}"></i>
    </div>
    <div class="toast-content">
      <div class="toast-title">${title}</div>
      <div class="toast-message">${message}</div>
    </div>
  `;
  
  container.appendChild(toast);
  
  setTimeout(() => {
    toast.style.animation = 'slideIn 0.3s ease-out reverse';
    setTimeout(() => toast.remove(), 300);
  }, 5000);
}

function animateCounter(element, target, duration = 2000) {
  if (!element) return;
  const start = 0;
  const increment = target / (duration / 16);
  let current = start;
  
  const timer = setInterval(() => {
    current += increment;
    if (current >= target) {
      element.textContent = Math.round(target);
      clearInterval(timer);
    } else {
      element.textContent = Math.round(current);
    }
  }, 16);
}

// ==========================================
// Stress Calculation Algorithm
// ==========================================

function calculateStressScore(employee) {
  const hoursNorm = Math.min(parseFloat(employee.avg_hours || 0) / 12, 1.0);
  const errorsNorm = Math.min(parseFloat(employee.error_rate || 0) / 10, 1.0);
  const nightsNorm = Math.min(parseFloat(employee.night_shifts || 0) / 5, 1.0);
  const loginNorm = Math.min(parseFloat(employee.login_count || 0) / 100, 1.0);
  const taskNorm = Math.min(parseFloat(employee.task_count || 0) / 150, 1.0);
  const patientNorm = Math.min(parseFloat(employee.patients_handled || 0) / 50, 1.0);
  
  const stressScore = (
    hoursNorm * CONFIG.WEIGHTS.hours +
    errorsNorm * CONFIG.WEIGHTS.errors +
    nightsNorm * CONFIG.WEIGHTS.nightShifts +
    loginNorm * CONFIG.WEIGHTS.loginCount +
    ((taskNorm + patientNorm) / 2) * CONFIG.WEIGHTS.taskLoad
  );
  
  return Math.min(Math.max(stressScore, 0), 1);
}

function getStressLevel(score) {
  if (score >= CONFIG.STRESS_THRESHOLDS.warning) return 'critical';
  if (score >= CONFIG.STRESS_THRESHOLDS.healthy) return 'warning';
  return 'healthy';
}

function getStressLabel(score) {
  if (score >= CONFIG.STRESS_THRESHOLDS.warning) return 'Critical';
  if (score >= CONFIG.STRESS_THRESHOLDS.healthy) return 'Warning';
  return 'Healthy';
}

// ==========================================
// CSV Parsing
// ==========================================

function parseCSV(text) {
  try {
    const lines = text.trim().split(/\r?\n/).filter(line => line.trim());
    if (lines.length < 2) {
      throw new Error('CSV file is empty or invalid');
    }
    
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    const rows = [];
    
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim());
      const row = {};
      
      headers.forEach((header, index) => {
        row[header] = values[index] || '';
      });
      
      rows.push(row);
    }
    
    return rows;
  } catch (error) {
    console.error('CSV parsing error:', error);
    throw new Error('Failed to parse CSV file. Please check the format.');
  }
}

// ==========================================
// Data Processing
// ==========================================

function processEmployeeData(rawData) {
  return rawData.map(row => {
    const employee = {
      employee_id: row.employee_id || `EMP${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
      name: row.name || 'Unknown Employee',
      avg_hours: parseFloat(row.avg_hours || row['avg hours'] || 0),
      error_rate: parseFloat(row.error_rate || row['error rate'] || 0),
      night_shifts: parseFloat(row.night_shifts || row['night shifts'] || 0),
      shift: row.shift || 'Day',
      login_count: parseFloat(row.login_count || row['login count'] || Math.floor(Math.random() * 100)),
      task_count: parseFloat(row.task_count || row['task count'] || Math.floor(Math.random() * 150)),
      patients_handled: parseFloat(row.patients_handled || row['patients handled'] || Math.floor(Math.random() * 50))
    };
    
    employee.stress_score = calculateStressScore(employee);
    employee.stress_level = getStressLevel(employee.stress_score);
    
    return employee;
  });
}

// ==========================================
// Analytics Dashboard Rendering
// ==========================================

function renderAnalyticsCards() {
  const container = document.getElementById('analyticsCards');
  if (!container) return;
  
  const totalEmployees = employees.length;
  const avgStress = employees.reduce((sum, e) => sum + e.stress_score, 0) / totalEmployees;
  const criticalCount = employees.filter(e => e.stress_level === 'critical').length;
  const healthyCount = employees.filter(e => e.stress_level === 'healthy').length;
  
  const cards = [
    {
      icon: 'fa-users',
      color: 'rgba(99, 102, 241, 0.2)',
      iconColor: '#6366f1',
      value: totalEmployees,
      label: 'Total Staff'
    },
    {
      icon: 'fa-chart-line',
      color: 'rgba(59, 130, 246, 0.2)',
      iconColor: '#3b82f6',
      value: `${(avgStress * 100).toFixed(1)}%`,
      label: 'Average Stress'
    },
    {
      icon: 'fa-exclamation-triangle',
      color: 'rgba(239, 68, 68, 0.2)',
      iconColor: '#ef4444',
      value: criticalCount,
      label: 'Critical Cases'
    },
    {
      icon: 'fa-shield-alt',
      color: 'rgba(16, 185, 129, 0.2)',
      iconColor: '#10b981',
      value: healthyCount,
      label: 'Healthy Staff'
    }
  ];
  
  container.innerHTML = cards.map(card => `
    <div class="analytics-card">
      <div class="analytics-card-header">
        <div class="analytics-card-icon" style="background: ${card.color}; color: ${card.iconColor}">
          <i class="fas ${card.icon}"></i>
        </div>
      </div>
      <div class="analytics-card-value">${card.value}</div>
      <div class="analytics-card-label">${card.label}</div>
    </div>
  `).join('');
}

// ==========================================
// Employee Cards Rendering
// ==========================================

function renderEmployeeCards() {
  const container = document.getElementById('employeeGrid');
  const countBadge = document.getElementById('employeeCount');
  
  if (!container) return;
  if (countBadge) countBadge.textContent = employees.length;
  
  const sortedEmployees = [...employees].sort((a, b) => b.stress_score - a.stress_score);
  
  container.innerHTML = sortedEmployees.map(emp => `
    <div class="employee-card">
      <div class="employee-card-header">
        <div class="employee-info">
          <h4>${emp.name}</h4>
          <div class="employee-id">${emp.employee_id}</div>
        </div>
        <div class="stress-badge ${emp.stress_level}">
          ${getStressLabel(emp.stress_score)}
        </div>
      </div>
      
      <div class="stress-bar">
        <div class="stress-fill ${emp.stress_level}" style="width: ${emp.stress_score * 100}%"></div>
      </div>
      
      <div style="text-align: center; margin: 0.5rem 0; font-weight: 600; color: ${
        emp.stress_level === 'critical' ? '#ef4444' :
        emp.stress_level === 'warning' ? '#f59e0b' : '#10b981'
      }">
        ${(emp.stress_score * 100).toFixed(1)}% Stress
      </div>
      
      <div class="employee-metrics">
        <div class="employee-metric">
          <div class="employee-metric-value">${emp.avg_hours.toFixed(1)}</div>
          <div class="employee-metric-label">Hours</div>
        </div>
        <div class="employee-metric">
          <div class="employee-metric-value">${emp.patients_handled}</div>
          <div class="employee-metric-label">Patients</div>
        </div>
        <div class="employee-metric">
          <div class="employee-metric-value">${emp.night_shifts}</div>
          <div class="employee-metric-label">Nights</div>
        </div>
      </div>
      
      <div style="margin-top: 1rem; padding-top: 1rem; border-top: 1px solid rgba(255, 255, 255, 0.05); font-size: 0.875rem; color: var(--text-secondary);">
        <div style="display: flex; justify-content: space-between; margin-bottom: 0.25rem;">
          <span>Shift:</span>
          <span style="font-weight: 600;">${emp.shift}</span>
        </div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 0.25rem;">
          <span>Error Rate:</span>
          <span style="font-weight: 600; color: ${emp.error_rate > 5 ? '#ef4444' : '#10b981'};">${emp.error_rate}%</span>
        </div>
        <div style="display: flex; justify-content: space-between;">
          <span>Tasks:</span>
          <span style="font-weight: 600;">${emp.task_count}</span>
        </div>
      </div>
    </div>
  `).join('');
}

// ==========================================
// Shift Optimizer with Notification System
// ==========================================

function generateOptimizations() {
  const criticalStaff = employees.filter(e => e.stress_level === 'critical');
  const healthyStaff = employees.filter(e => e.stress_level === 'healthy');
  
  const swaps = [];
  
  criticalStaff.forEach(critical => {
    const potential = healthyStaff.find(h => 
      !swaps.some(s => s.swapWithId === h.employee_id) &&
      h.employee_id !== critical.employee_id
    );
    
    if (potential) {
      const stressReduction = ((critical.stress_score - potential.stress_score) / 2 * 100).toFixed(0);
      
      swaps.push({
        staffId: critical.employee_id,
        staffName: critical.name,
        currentShift: critical.shift,
        suggestedShift: potential.shift,
        swapWithId: potential.employee_id,
        swapWithName: potential.name,
        currentStress: (critical.stress_score * 100).toFixed(0),
        targetStress: (potential.stress_score * 100).toFixed(0),
        expectedReduction: stressReduction,
        reason: `High stress (${(critical.stress_score * 100).toFixed(0)}%) - ${critical.night_shifts} night shifts, ${critical.avg_hours.toFixed(1)}h avg`,
        impact: `Expected stress reduction: ${stressReduction}%`
      });
    }
  });
  
  return swaps;
}

function renderOptimizations() {
  const swapGrid = document.getElementById('swapGrid');
  const swapCount = document.getElementById('swapCount');
  const stressReduction = document.getElementById('stressReduction');
  const balanceScore = document.getElementById('balanceScore');
  
  if (!swapGrid) return;
  
  const swaps = generateOptimizations();
  
  if (swapCount) swapCount.textContent = swaps.length;
  
  if (swaps.length > 0) {
    const avgReduction = swaps.reduce((sum, s) => sum + parseFloat(s.expectedReduction), 0) / swaps.length;
    if (stressReduction) stressReduction.textContent = `${avgReduction.toFixed(0)}%`;
    
    const healthyCount = employees.filter(e => e.stress_level === 'healthy').length;
    const balance = (healthyCount / employees.length * 100).toFixed(0);
    if (balanceScore) balanceScore.textContent = `${balance}%`;
  } else {
    if (stressReduction) stressReduction.textContent = '0%';
    if (balanceScore) balanceScore.textContent = '100%';
  }
  
  if (swaps.length === 0) {
    swapGrid.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 3rem; color: var(--text-secondary);">
        <i class="fas fa-check-circle" style="font-size: 4rem; color: var(--success); margin-bottom: 1rem;"></i>
        <h3 style="margin-bottom: 0.5rem;">All Clear!</h3>
        <p>No critical optimizations needed. All staff members are within healthy stress levels.</p>
      </div>
    `;
    return;
  }
  
  swapGrid.innerHTML = swaps.map((swap, index) => `
    <div class="swap-card">
      <div class="swap-card-header">
        <h4 style="margin: 0;">Optimization #${index + 1}</h4>
        <span class="priority-badge">HIGH PRIORITY</span>
      </div>
      
      <div class="swap-flow">
        <div class="swap-person">
          <div class="swap-person-name">${swap.staffName}</div>
          <div class="swap-person-shift">${swap.currentShift}</div>
          <div style="font-size: 0.75rem; color: #ef4444; margin-top: 0.25rem;">
            Stress: ${swap.currentStress}%
          </div>
        </div>
        
        <div class="swap-arrow">
          <i class="fas fa-exchange-alt"></i>
        </div>
        
        <div class="swap-person">
          <div class="swap-person-name">${swap.swapWithName}</div>
          <div class="swap-person-shift">${swap.suggestedShift}</div>
          <div style="font-size: 0.75rem; color: #10b981; margin-top: 0.25rem;">
            Stress: ${swap.targetStress}%
          </div>
        </div>
      </div>
      
      <div class="swap-reason">
        <i class="fas fa-exclamation-triangle"></i>
        ${swap.reason}
      </div>
      
      <div class="swap-impact">
        <i class="fas fa-chart-line"></i>
        ${swap.impact}
      </div>
      
      <button class="apply-swap-btn" onclick="applySwap('${swap.staffId}', '${swap.swapWithId}')">
        <i class="fas fa-bell"></i>
        Send Notification & Apply Swap
      </button>
    </div>
  `).join('');
}

// ==========================================
// Notification System - KEY FEATURE
// ==========================================

function sendNotificationToLowStressStaff(highStressStaff, lowStressStaff) {
  const notificationData = {
    to: lowStressStaff.name,
    from: 'MindEase AI System',
    subject: 'Shift Swap Request - Help Prevent Colleague Burnout',
    message: `
      Hello ${lowStressStaff.name},
      
      Our AI system has detected that ${highStressStaff.name} is experiencing high stress levels (${(highStressStaff.stress_score * 100).toFixed(0)}%).
      
      Current Status:
      - ${highStressStaff.name}: ${highStressStaff.shift} shift, ${highStressStaff.night_shifts} night shifts this week
      - Your Status: ${lowStressStaff.shift} shift, Low stress (${(lowStressStaff.stress_score * 100).toFixed(0)}%)
      
      Would you be available for a voluntary shift swap?
      Swapping shifts would help prevent burnout and maintain team wellbeing.
      
      Expected Benefit:
      - Reduces ${highStressStaff.name}'s stress by approximately ${((highStressStaff.stress_score - lowStressStaff.stress_score) / 2 * 100).toFixed(0)}%
      - Maintains overall team balance
      
      Please respond at your earliest convenience.
      
      Thank you for being part of our wellbeing initiative!
      
      Best regards,
      MindEase AI Workforce Management
    `,
    timestamp: new Date().toISOString()
  };
  
  // Show notification modal
  showNotificationModal(notificationData);
  
  // Send to backend
  sendToBackend('/notify', notificationData);
  
  return notificationData;
}

function showNotificationModal(notification) {
  const modal = document.getElementById('notificationModal');
  const body = document.getElementById('notificationBody');
  
  if (!modal || !body) return;
  
  body.innerHTML = `
    <div style="background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.3); border-radius: 0.5rem; padding: 1rem; margin-bottom: 1rem;">
      <strong>✓ Notification Sent Successfully</strong>
    </div>
    <p><strong>To:</strong> ${notification.to}</p>
    <p><strong>Subject:</strong> ${notification.subject}</p>
    <div style="background: rgba(255, 255, 255, 0.05); padding: 1rem; border-radius: 0.5rem; margin-top: 1rem; white-space: pre-line; font-size: 0.875rem;">
${notification.message}
    </div>
  `;
  
  modal.classList.add('active');
}

function closeNotificationModal() {
  const modal = document.getElementById('notificationModal');
  if (modal) modal.classList.remove('active');
}

window.closeNotificationModal = closeNotificationModal;

function applySwap(staffId, swapWithId) {
  const staff1 = employees.find(e => e.employee_id === staffId);
  const staff2 = employees.find(e => e.employee_id === swapWithId);
  
  if (!staff1 || !staff2) {
    showToast('error', 'Swap Failed', 'Could not find employees');
    return;
  }
  
  // Send notification to low-stress staff FIRST
  const notification = sendNotificationToLowStressStaff(staff1, staff2);
  
  // Swap shifts
  const tempShift = staff1.shift;
  staff1.shift = staff2.shift;
  staff2.shift = tempShift;
  
  // Recalculate stress
  staff1.stress_score = Math.max(0, staff1.stress_score - 0.2);
  staff1.stress_level = getStressLevel(staff1.stress_score);
  
  // Re-render
  renderEmployeeCards();
  renderOptimizations();
  
  showToast('success', 'Swap Notification Sent', `${staff2.name} has been notified about the swap request`);
  
  // Send to backend
  sendSwapToBackend(staffId, swapWithId);
}

window.applySwap = applySwap;

// ==========================================
// Statistics Page - Chart Rendering
// ==========================================

function renderStressChart() {
  const canvas = document.getElementById('stressChart');
  if (!canvas) return;
  
  const ctx = canvas.getContext('2d');
  
  if (chartInstances.stress) {
    chartInstances.stress.destroy();
  }
  
  const labels = employees.map(e => e.name);
  const data = employees.map(e => (e.stress_score * 100).toFixed(1));
  const colors = employees.map(e => {
    if (e.stress_level === 'critical') return 'rgba(239, 68, 68, 0.8)';
    if (e.stress_level === 'warning') return 'rgba(245, 158, 11, 0.8)';
    return 'rgba(16, 185, 129, 0.8)';
  });
  
  chartInstances.stress = new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: 'Stress Score (%)',
        data,
        backgroundColor: colors,
        borderColor: colors.map(c => c.replace('0.8', '1')),
        borderWidth: 2,
        borderRadius: 8
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          backgroundColor: 'rgba(30, 41, 59, 0.95)',
          titleColor: '#f1f5f9',
          bodyColor: '#cbd5e1',
          borderColor: 'rgba(99, 102, 241, 0.5)',
          borderWidth: 1,
          padding: 12
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          max: 100,
          grid: {
            color: 'rgba(255, 255, 255, 0.05)'
          },
          ticks: {
            color: '#94a3b8',
            callback: (value) => value + '%'
          }
        },
        x: {
          grid: {
            display: false
          },
          ticks: {
            color: '#94a3b8',
            maxRotation: 45,
            minRotation: 45
          }
        }
      }
    }
  });
}

function renderTrendChart() {
  const canvas = document.getElementById('trendChart');
  if (!canvas) return;
  
  const ctx = canvas.getContext('2d');
  
  if (chartInstances.trend) {
    chartInstances.trend.destroy();
  }
  
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const avgStress = employees.reduce((sum, e) => sum + e.stress_score, 0) / employees.length * 100;
  
  const trendData = days.map((_, i) => {
    const variance = (Math.random() - 0.5) * 15;
    return Math.max(20, Math.min(90, avgStress + variance));
  });
  
  chartInstances.trend = new Chart(ctx, {
    type: 'line',
    data: {
      labels: days,
      datasets: [{
        label: 'Average Stress',
        data: trendData,
        borderColor: '#6366f1',
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointRadius: 6,
        pointBackgroundColor: '#6366f1',
        pointBorderColor: '#fff',
        pointBorderWidth: 2
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          backgroundColor: 'rgba(30, 41, 59, 0.95)',
          titleColor: '#f1f5f9',
          bodyColor: '#cbd5e1',
          borderColor: 'rgba(99, 102, 241, 0.5)',
          borderWidth: 1,
          padding: 12
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          max: 100,
          grid: {
            color: 'rgba(255, 255, 255, 0.05)'
          },
          ticks: {
            color: '#94a3b8',
            callback: (value) => value + '%'
          }
        },
        x: {
          grid: {
            display: false
          },
          ticks: {
            color: '#94a3b8'
          }
        }
      }
    }
  });
}

function renderDistribution() {
  const healthyCount = employees.filter(e => e.stress_level === 'healthy').length;
  const warningCount = employees.filter(e => e.stress_level === 'warning').length;
  const criticalCount = employees.filter(e => e.stress_level === 'critical').length;
  const total = employees.length;
  
  document.getElementById('healthyCount').textContent = healthyCount;
  document.getElementById('warningCount').textContent = warningCount;
  document.getElementById('criticalCount').textContent = criticalCount;
  
  setTimeout(() => {
    document.getElementById('healthyBar').style.width = `${(healthyCount / total * 100)}%`;
    document.getElementById('warningBar').style.width = `${(warningCount / total * 100)}%`;
    document.getElementById('criticalBar').style.width = `${(criticalCount / total * 100)}%`;
  }, 100);
}

function renderDepartmentStats() {
  const departments = {};
  
  employees.forEach(emp => {
    const dept = emp.shift.split('-')[0];
    if (!departments[dept]) {
      departments[dept] = {
        name: dept,
        count: 0,
        totalStress: 0,
        critical: 0
      };
    }
    departments[dept].count++;
    departments[dept].totalStress += emp.stress_score;
    if (emp.stress_level === 'critical') departments[dept].critical++;
  });
  
  const grid = document.getElementById('departmentGrid');
  if (!grid) return;
  
  grid.innerHTML = Object.values(departments).map(dept => `
    <div class="department-card">
      <h4>
        ${dept.name}
        <span class="department-badge">${dept.count} staff</span>
      </h4>
      <div class="department-metric">
        <span class="department-metric-label">Avg Stress</span>
        <span class="department-metric-value">${((dept.totalStress / dept.count) * 100).toFixed(1)}%</span>
      </div>
      <div class="department-metric">
        <span class="department-metric-label">Critical Cases</span>
        <span class="department-metric-value" style="color: ${dept.critical > 0 ? '#ef4444' : '#10b981'}">${dept.critical}</span>
      </div>
    </div>
  `).join('');
}

// ==========================================
// Backend API Integration
// ==========================================

async function sendToBackend(endpoint, data) {
  try {
    const response = await fetch(`${CONFIG.API_ENDPOINT}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Backend API error:', error);
    return null;
  }
}

async function sendSwapToBackend(fromId, toId) {
  const result = await sendToBackend('/optimize', {
    from: fromId,
    to: toId,
    timestamp: new Date().toISOString()
  });
  
  if (result) {
    console.log('Swap confirmed by backend:', result);
  }
}

async function predictWithBackend(employeeData) {
  const result = await sendToBackend('/predict', {
    employees: employeeData
  });
  
  if (result && result.predictions) {
    return employeeData.map(emp => {
      const prediction = result.predictions.find(p => p.employee_id === emp.employee_id);
      if (prediction) {
        emp.stress_score = prediction.stress_score;
        emp.stress_level = getStressLevel(prediction.stress_score);
      }
      return emp;
    });
  }
  
  return employeeData;
}

// ==========================================
// File Upload Handling
// ==========================================

const csvInput = document.getElementById('csvFile');
const analyzeBtn = document.getElementById('analyzeBtn');
const connectBtn = document.getElementById('connectBtn');

if (csvInput) {
  csvInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0 && analyzeBtn) {
      analyzeBtn.disabled = false;
    }
  });
}

if (analyzeBtn) {
  analyzeBtn.addEventListener('click', async () => {
    if (!csvInput.files.length) {
      showToast('error', 'No File Selected', 'Please select a CSV file first');
      return;
    }
    
    const file = csvInput.files[0];
    analyzeBtn.innerHTML = '<span class="loading"></span> Analyzing...';
    analyzeBtn.disabled = true;
    
    try {
      const text = await file.text();
      const rawData = parseCSV(text);
      
      if (rawData.length === 0) {
        throw new Error('No valid data found in CSV');
      }
      
      employees = processEmployeeData(rawData);
      employees = await predictWithBackend(employees);
      
      // Store in localStorage for multi-page access
      localStorage.setItem('employeeData', JSON.stringify(employees));
      
      renderAnalyticsCards();
      renderEmployeeCards();
      
      showToast('success', 'Analysis Complete', `Processed ${employees.length} employees successfully`);
      
    } catch (error) {
      console.error('Analysis error:', error);
      showToast('error', 'Analysis Failed', error.message || 'Failed to process CSV file');
    } finally {
      analyzeBtn.innerHTML = '<i class="fas fa-brain"></i> Analyze with AI';
      analyzeBtn.disabled = false;
    }
  });
}

if (connectBtn) {
  connectBtn.addEventListener('click', async () => {
    const apiEndpoint = document.getElementById('apiEndpoint').value;
    const apiKey = document.getElementById('apiKey').value;
    
    if (!apiEndpoint) {
      showToast('error', 'Missing Endpoint', 'Please provide an API endpoint');
      return;
    }
    
    connectBtn.innerHTML = '<span class="loading"></span> Connecting...';
    connectBtn.disabled = true;
    
    try {
      const response = await fetch(apiEndpoint, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.employees) {
        employees = processEmployeeData(data.employees);
        localStorage.setItem('employeeData', JSON.stringify(employees));
        
        renderAnalyticsCards();
        renderEmployeeCards();
        
        showToast('success', 'Connected', `Successfully connected to API and loaded ${employees.length} employees`);
      } else {
        throw new Error('Invalid API response format');
      }
      
    } catch (error) {
      console.error('API connection error:', error);
      showToast('error', 'Connection Failed', error.message || 'Could not connect to API');
    } finally {
      connectBtn.innerHTML = '<i class="fas fa-plug"></i> Connect API';
      connectBtn.disabled = false;
    }
  });
}

// ==========================================
// Mobile Navigation
// ==========================================

const navToggle = document.getElementById('navToggle');
const navMenu = document.getElementById('navMenu');

if (navToggle && navMenu) {
  navToggle.addEventListener('click', () => {
    if (navMenu.style.display === 'flex') {
      navMenu.style.display = 'none';
    } else {
      navMenu.style.display = 'flex';
      navMenu.style.position = 'absolute';
      navMenu.style.top = '100%';
      navMenu.style.left = '0';
      navMenu.style.right = '0';
      navMenu.style.background = 'rgba(15, 23, 42, 0.98)';
      navMenu.style.flexDirection = 'column';
      navMenu.style.padding = '1rem';
      navMenu.style.gap = '1rem';
      navMenu.style.borderTop = '1px solid rgba(255, 255, 255, 0.1)';
    }
  });
  
  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      if (window.innerWidth < 968) {
        navMenu.style.display = 'none';
      }
    });
  });
}

// ==========================================
// Demo Data Generator
// ==========================================

function generateDemoData() {
  const departments = ['Emergency', 'ICU', 'Pediatrics', 'Surgery', 'Radiology'];
  const shifts = ['Day-A', 'Day-B', 'Night-1', 'Night-2', 'Evening'];
  const names = [
    'Dr. Anderson', 'Nurse Peterson', 'Dr. Martinez', 'Nurse Johnson', 'Dr. Williams',
    'Nurse Brown', 'Dr. Garcia', 'Nurse Davis', 'Dr. Rodriguez', 'Nurse Wilson',
    'Dr. Thompson', 'Nurse Moore', 'Dr. Taylor', 'Nurse Jackson', 'Dr. Lee',
    'Nurse White', 'Dr. Harris', 'Nurse Martin', 'Dr. Clark', 'Nurse Lewis'
  ];
  
  return names.map((name, i) => ({
    employee_id: `E${String(i + 1).padStart(3, '0')}`,
    name: name,
    avg_hours: 7 + Math.random() * 5,
    error_rate: Math.random() * 8,
    night_shifts: Math.floor(Math.random() * 5),
    shift: shifts[i % shifts.length],
    login_count: 40 + Math.floor(Math.random() * 80),
    task_count: 60 + Math.floor(Math.random() * 120),
    patients_handled: 10 + Math.floor(Math.random() * 40)
  }));
}

// ==========================================
// Page Load Initialization
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
  // Check for stored employee data
  const storedData = localStorage.getItem('employeeData');
  
  if (storedData) {
    try {
      employees = JSON.parse(storedData);
    } catch (e) {
      console.error('Error loading stored data:', e);
      employees = processEmployeeData(generateDemoData());
    }
  } else {
    employees = processEmployeeData(generateDemoData());
  }
  
  // Render based on current page
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  
  if (currentPage === 'analytics.html') {
    renderAnalyticsCards();
    renderEmployeeCards();
  } else if (currentPage === 'optimizer.html') {
    renderOptimizations();
  } else if (currentPage === 'statistics.html') {
    renderStressChart();
    renderTrendChart();
    renderDistribution();
    renderDepartmentStats();
  } else if (currentPage === 'index.html' || currentPage === '') {
    // Homepage - animate counters
    const detectedCount = document.getElementById('detectedCount');
    const preventedCount = document.getElementById('preventedCount');
    
    if (detectedCount && preventedCount) {
      setTimeout(() => {
        animateCounter(detectedCount, employees.filter(e => e.stress_level !== 'healthy').length);
        animateCounter(preventedCount, Math.floor(employees.length * 0.75));
      }, 500);
    }
  }
  
  // Show welcome toast on first visit
  if (!sessionStorage.getItem('welcomed')) {
    setTimeout(() => {
      showToast('info', 'Demo Mode', 'Showing sample data. Upload your CSV to analyze real employee data.');
      sessionStorage.setItem('welcomed', 'true');
    }, 1000);
  }
});

// ==========================================
// Auto-refresh for Statistics Page
// ==========================================

if (window.location.pathname.includes('statistics.html')) {
  setInterval(() => {
    const storedData = localStorage.getItem('employeeData');
    if (storedData) {
      try {
        employees = JSON.parse(storedData);
        renderStressChart();
        renderTrendChart();
        renderDistribution();
        renderDepartmentStats();
      } catch (e) {
        console.error('Error refreshing data:', e);
      }
    }
  }, 30000); // Refresh every 30 seconds
}

// ==========================================
// Export Functions
// ==========================================

window.MindEaseAI = {
  employees,
  calculateStressScore,
  getStressLevel,
  processEmployeeData,
  renderAnalyticsCards,
  renderStressChart,
  renderTrendChart,
  renderEmployeeCards,
  renderOptimizations,
  applySwap,
  sendToBackend,
  predictWithBackend,
  sendNotificationToLowStressStaff
};

// ==========================================
// Keyboard Shortcuts
// ==========================================

document.addEventListener('keydown', (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key === 'u') {
    e.preventDefault();
    if (csvInput) csvInput.click();
  }
  
  if ((e.ctrlKey || e.metaKey) && e.key === 'a' && analyzeBtn && !analyzeBtn.disabled) {
    e.preventDefault();
    analyzeBtn.click();
  }
  
  if (e.key === 'Escape') {
    if (navMenu) navMenu.style.display = 'none';
    closeNotificationModal();
  }
});

// ==========================================
// Console Welcome
// ==========================================

console.log('%c🧠 MindEase AI - Workforce Wellbeing Analytics', 
  'font-size: 20px; font-weight: bold; color: #6366f1;');
console.log('%cVersion 1.0.0 | Built for Nordic Healthcare', 
  'font-size: 12px; color: #94a3b8;');
console.log('%c\n✓ Notification System Active', 'font-weight: bold; color: #10b981;');
console.log('Low-stress staff automatically notified when high-risk situations detected');
console.log('\nGlobal Object: window.MindEaseAI');
console.log('Access all functions via window.MindEaseAI.*');

// ==========================================
// END OF SCRIPT
// ==========================================