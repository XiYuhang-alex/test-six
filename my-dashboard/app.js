const state = { data: null };
let barChart = null;
let lineChart = null;

const loadData = async () => {
  $('#status').text('加载中...').show();
  try {
    const response = await fetch('data/expenses.json');
    if (!response.ok) {
      throw new Error('HTTP ' + response.status);
    }
    const data = await response.json();
    if (data.series.length === 0) {
      $('#status').text('暂无数据').show();
      return;
    }
    state.data = data;
    $('#sub-title').text(data.title + ' · 数据来源：自主模拟数据');
    $('#status').hide();
    
    renderCards(data);
    renderBarChart(data);
    renderLineChart(data);
    
  } catch (error) {
    $('#status').text('加载失败: ' + error.message).show();
  }
};

const renderCards = (data) => {
  const days = data.days;
  data.series.forEach(s => {
    const total = s.amounts.reduce((sum, n) => sum + n, 0);
    $('#cards').append(`
      <div class="col-md-4">
        <div class="card">
          <div class="card-body">
            <h3 class="card-title h6">${s.category}</h3>
            <p class="card-text fs-4">${total} 元</p >
            <p class="card-text small text-muted">共 ${days.length} 天累计消费</p >
          </div>
        </div>
      </div>
    `);
  });
};

const renderBarChart = (data) => {
  if (barChart === null) {
    barChart = echarts.init(document.querySelector('#bar-chart'));
  }
  barChart.setOption({
    title: { text: '一周各时段消费金额', left: 'center' },
    tooltip: { trigger: 'axis' },
    legend: { bottom: 0 },
    xAxis: { data: data.days },
    yAxis: { name: '金额 (元)' },
    series: data.series.map(s => ({
      name: s.category,
      type: 'bar',
      data: s.amounts
    }))
  });
};

const renderLineChart = (data) => {
  if (lineChart !== null) {
    lineChart.destroy();
  }
  const ctx = document.querySelector('#line-chart');
  lineChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: data.days,
      datasets: data.series.map(s => ({
        label: s.category,
        data: s.amounts,
        borderWidth: 1
      }))
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        title: { display: true, text: '消费趋势（单位：元）' }
      }
    }
  });
};

window.addEventListener('resize', () => {
  if (barChart) barChart.resize();
});

$('#cards').on('click', '.card', function () {
  $(this).toggleClass('border-primary shadow');
});

loadData();