<script>
  // -----------------------
  // MOCK DATA
  // -----------------------

  const today = {
    jobsScheduled: 42,
    jobsCompleted: 18,
    jobsCancelled: 2,
    revenueBooked: 6850,
    revenueActual: 2950,
    activeCrews: 8,
    issues: 3,
  };

  const revenue = {
    weekly: 48250,
    monthly: 198400,
    avgTicket: 168,
    recurringPct: 74,
  };

  const capacity = {
    next7: 91,
    next14: 84,
    next30: 72,
    overbookedDays: 2,
  };

  const cleaners = [
    { name: 'Crew Alpha', revPerHour: 102, onTime: 99, callbacks: 0 },
    { name: 'Crew Bravo', revPerHour: 88, onTime: 94, callbacks: 1 },
    { name: 'Crew Charlie', revPerHour: 76, onTime: 91, callbacks: 3 },
  ];

  const clients = {
    activeRecurring: 312,
    churn30: 3.1,
    skips: 18,
    atRisk: 6,
  };

  const alerts = [
    { level: 'red', text: '2 missed cleans yesterday' },
    { level: 'yellow', text: '5 quotes expiring today' },
    { level: 'red', text: 'Friday coverage risk (92% booked)' },
  ];

  const revenueTrend = [120, 135, 132, 148, 155, 162, 168];
</script>

<div class="min-h-screen bg-gray-50 p-6 space-y-8">
  <!-- HEADER -->
  <header class="flex items-center justify-between">
    <h1 class="text-2xl font-semibold text-gray-900">Operations Dashboard</h1>
    <span class="text-sm text-gray-500"> Today </span>
  </header>

  <!-- TODAY AT A GLANCE -->
  <section class="grid grid-cols-2 md:grid-cols-7 gap-4">
    <div class="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
      <p class="text-xs text-gray-500">Jobs Scheduled</p>
      <p class="text-xl font-semibold">{today.jobsScheduled}</p>
    </div>

    <div class="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
      <p class="text-xs text-gray-500">Completed</p>
      <p class="text-xl font-semibold">{today.jobsCompleted}</p>
    </div>

    <div class="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
      <p class="text-xs text-gray-500">Cancelled</p>
      <p class="text-xl font-semibold text-red-500">{today.jobsCancelled}</p>
    </div>

    <div class="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
      <p class="text-xs text-gray-500">Booked Revenue</p>
      <p class="text-xl font-semibold">${today.revenueBooked}</p>
    </div>

    <div class="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
      <p class="text-xs text-gray-500">Actual Revenue</p>
      <p class="text-xl font-semibold">${today.revenueActual}</p>
    </div>

    <div class="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
      <p class="text-xs text-gray-500">Active Crews</p>
      <p class="text-xl font-semibold">{today.activeCrews}</p>
    </div>

    <div class="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
      <p class="text-xs text-gray-500">Open Issues</p>
      <p class="text-xl font-semibold text-yellow-500">{today.issues}</p>
    </div>
  </section>

  <!-- REVENUE HEALTH -->
  <section class="grid md:grid-cols-3 gap-4">
    <div class="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
      <p class="text-xs text-gray-500">Monthly Revenue</p>
      <p class="text-2xl font-semibold">${revenue.monthly}</p>

      <!-- Sparkline -->
      <svg viewBox="0 0 100 30" class="mt-2 w-full h-8">
        <polyline
          fill="none"
          stroke="black"
          stroke-width="2"
          points={revenueTrend
            .map((v, i) => `${i * 16},${30 - v / 7}`)
            .join(' ')}
        />
      </svg>
    </div>

    <div class="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
      <p class="text-xs text-gray-500">Average Ticket</p>
      <p class="text-2xl font-semibold">${revenue.avgTicket}</p>
    </div>

    <div class="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
      <p class="text-xs text-gray-500">Recurring Revenue</p>
      <p class="text-2xl font-semibold">{revenue.recurringPct}%</p>
    </div>
  </section>

  <!-- CAPACITY -->
  <section class="grid md:grid-cols-4 gap-4">
    <div class="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
      <p class="text-xs text-gray-500">Next 7 Days Booked</p>
      <p class="text-xl font-semibold">{capacity.next7}%</p>
    </div>

    <div class="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
      <p class="text-xs text-gray-500">Next 14 Days</p>
      <p class="text-xl font-semibold">{capacity.next14}%</p>
    </div>

    <div class="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
      <p class="text-xs text-gray-500">Next 30 Days</p>
      <p class="text-xl font-semibold">{capacity.next30}%</p>
    </div>

    <div class="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
      <p class="text-xs text-gray-500">Overbooked Days</p>
      <p class="text-xl font-semibold text-red-500">
        {capacity.overbookedDays}
      </p>
    </div>
  </section>

  <!-- CLEANER PERFORMANCE -->
  <section class="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
    <h2 class="text-sm font-semibold mb-3">Cleaner Performance</h2>

    <table class="w-full text-sm">
      <thead class="text-gray-500">
        <tr>
          <th class="text-left py-1">Crew</th>
          <th class="text-center py-1">$ / Hr</th>
          <th class="text-center py-1">On-Time</th>
          <th class="text-center py-1">Callbacks</th>
        </tr>
      </thead>

      <tbody>
        {#each cleaners as c}
          <tr class="border-t">
            <td class="py-1">{c.name}</td>
            <td class="text-center">${c.revPerHour}</td>
            <td class="text-center">{c.onTime}%</td>
            <td class={`text-center ${c.callbacks > 0 ? 'text-red-500' : ''}`}>
              {c.callbacks}
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  </section>

  <!-- CLIENT HEALTH + ALERTS -->
  <section class="grid md:grid-cols-2 gap-4">
    <div class="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
      <h2 class="text-sm font-semibold mb-3">Client Health</h2>
      <ul class="space-y-1 text-sm">
        <li>Active Recurring: {clients.activeRecurring}</li>
        <li>30-Day Churn: {clients.churn30}%</li>
        <li>Skips This Month: {clients.skips}</li>
        <li class="text-red-500 font-medium">
          At-Risk Clients: {clients.atRisk}
        </li>
      </ul>
    </div>

    <div class="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
      <h2 class="text-sm font-semibold mb-3">Action Required</h2>

      <ul class="space-y-2 text-sm">
        {#each alerts as a}
          <li class="flex items-center gap-2">
            <span
              class={`w-2 h-2 rounded-full ${
                a.level === 'red' ? 'bg-red-500' : 'bg-yellow-400'
              }`}
            ></span>
            {a.text}
          </li>
        {/each}
      </ul>
    </div>
  </section>
</div>
