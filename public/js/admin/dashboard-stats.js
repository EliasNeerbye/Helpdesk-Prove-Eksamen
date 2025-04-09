document.addEventListener('DOMContentLoaded', function() {
    loadRoleBasedStats();
});

function loadRoleBasedStats() {
    const statsContainer = document.getElementById('role-stats');
    if (!statsContainer) return;
    
    fetch('/api/ticket/stats')
        .then(response => response.json())
        .then(data => {
            if (data.stats && data.stats.byRole) {
                const roleStats = data.stats.byRole;
                
                statsContainer.innerHTML = `
                    <div class="card">
                        <div class="card-header">
                            <h3>Support Team Statistics</h3>
                        </div>
                        <div class="card-body">
                            <div class="role-stats-grid">
                                <div class="role-stat-card">
                                    <h4>1st Line Support</h4>
                                    <div class="stat-numbers">
                                        <div class="stat-item">
                                            <span class="stat-label">Total Tickets:</span>
                                            <span class="stat-value">${roleStats['1st-line'].total}</span>
                                        </div>
                                        <div class="stat-item">
                                            <span class="stat-label">Resolved:</span>
                                            <span class="stat-value">${roleStats['1st-line'].resolved}</span>
                                        </div>
                                        <div class="stat-item">
                                            <span class="stat-label">Closed:</span>
                                            <span class="stat-value">${roleStats['1st-line'].closed}</span>
                                        </div>
                                        <div class="stat-item">
                                            <span class="stat-label">Resolution Rate:</span>
                                            <span class="stat-value">${calculateRate(roleStats['1st-line'].resolved, roleStats['1st-line'].total)}%</span>
                                        </div>
                                    </div>
                                </div>
                                
                                <div class="role-stat-card">
                                    <h4>2nd Line Support</h4>
                                    <div class="stat-numbers">
                                        <div class="stat-item">
                                            <span class="stat-label">Total Tickets:</span>
                                            <span class="stat-value">${roleStats['2nd-line'].total}</span>
                                        </div>
                                        <div class="stat-item">
                                            <span class="stat-label">Resolved:</span>
                                            <span class="stat-value">${roleStats['2nd-line'].resolved}</span>
                                        </div>
                                        <div class="stat-item">
                                            <span class="stat-label">Closed:</span>
                                            <span class="stat-value">${roleStats['2nd-line'].closed}</span>
                                        </div>
                                        <div class="stat-item">
                                            <span class="stat-label">Resolution Rate:</span>
                                            <span class="stat-value">${calculateRate(roleStats['2nd-line'].resolved, roleStats['2nd-line'].total)}%</span>
                                        </div>
                                    </div>
                                </div>
                                
                                <div class="role-stat-card">
                                    <h4>Unassigned Tickets</h4>
                                    <div class="stat-numbers">
                                        <div class="stat-item">
                                            <span class="stat-label">Total:</span>
                                            <span class="stat-value">${roleStats.unassigned}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
            } else {
                statsContainer.innerHTML = `
                    <div class="card">
                        <div class="card-header">
                            <h3>Support Team Statistics</h3>
                        </div>
                        <div class="card-body">
                            <div class="empty-state small">
                                <i class="fas fa-chart-line empty-icon"></i>
                                <h4>No Data Available</h4>
                                <p>Statistics will appear once tickets are assigned to support roles.</p>
                            </div>
                        </div>
                    </div>
                `;
            }
        })
        .catch(error => {
            console.error('Error loading role stats:', error);
            statsContainer.innerHTML = `
                <div class="card">
                    <div class="card-header">
                        <h3>Support Team Statistics</h3>
                    </div>
                    <div class="card-body">
                        <div class="error-message">
                            <p>Failed to load statistics. Please try again later.</p>
                        </div>
                    </div>
                </div>
            `;
        });
}

function calculateRate(part, total) {
    if (!total) return 0;
    return Math.round((part / total) * 100);
}