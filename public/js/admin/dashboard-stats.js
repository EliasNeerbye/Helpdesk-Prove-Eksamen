document.addEventListener('DOMContentLoaded', function() {
    loadRoleBasedStats();
    loadSupportPerformanceMetrics();
});

function loadRoleBasedStats() {
    const statsContainer = document.getElementById('role-stats');
    if (!statsContainer) return;
    
    fetch('/api/ticket/stats')
        .then(response => {
    return response.json();
})
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
                                            <span class="stat-label">Open:</span>
                                            <span class="stat-value">${roleStats['1st-line'].open || 0}</span>
                                        </div>
                                        <div class="stat-item">
                                            <span class="stat-label">In Progress:</span>
                                            <span class="stat-value">${roleStats['1st-line'].inProgress || 0}</span>
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
                                            <span class="stat-value">${calculateRate(roleStats['1st-line'].resolved + roleStats['1st-line'].closed, roleStats['1st-line'].total)}%</span>
                                            <script>
                                            console.log('1st Line Support Resolution Rate:', ${calculateRate(roleStats['1st-line'].resolved + roleStats['1st-line'].closed, roleStats['1st-line'].total)});
                                            console.log('1st Line Support Total Tickets:', ${roleStats['1st-line'].total});
                                            console.log('1st Line Support Resolved:', ${roleStats['1st-line'].resolved});
                                            console.log('1st Line Support Closed:', ${roleStats['1st-line'].closed});
                                            </script>
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
                                            <span class="stat-label">Open:</span>
                                            <span class="stat-value">${roleStats['2nd-line'].open || 0}</span>
                                        </div>
                                        <div class="stat-item">
                                            <span class="stat-label">In Progress:</span>
                                            <span class="stat-value">${roleStats['2nd-line'].inProgress || 0}</span>
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
                                            <span class="stat-value">${calculateRate(roleStats['2nd-line'].resolved + roleStats['1st-line'].closed, roleStats['2nd-line'].total)}%</span>
                                            <script>
                                            console.log('2nd Line Support Resolution Rate:', ${calculateRate(roleStats['2nd-line'].resolved + roleStats['1st-line'].closed, roleStats['2nd-line'].total)});
                                            console.log('2nd Line Support Total Tickets:', ${roleStats['2nd-line'].total});
                                            console.log('2nd Line Support Resolved:', ${roleStats['2nd-line'].resolved});
                                            console.log('2nd Line Support Closed:', ${roleStats['2nd-line'].closed});
                                            </script>
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
                                        <div class="stat-item">
                                            <span class="stat-label">Action Required:</span>
                                            <span class="stat-value highlight-warning">${roleStats.unassigned > 0 ? 'Yes' : 'No'}</span>
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

function loadSupportPerformanceMetrics() {
    const performanceContainer = document.getElementById('support-performance');
    if (!performanceContainer) return;
    
    fetch('/api/ticket/stats')
        .then(response => {
    return response.json();
})
        .then(data => {
            if (data.stats && data.stats.byRole) {
                const roleStats = data.stats.byRole;
                
                // Calculate average resolution times and other metrics
                // Note: These would ideally be calculated on the server, this is a simplified version
                
                performanceContainer.innerHTML = `
                    <div class="card">
                        <div class="card-header">
                            <h3>Support Team Performance</h3>
                        </div>
                        <div class="card-body">
                            <div class="performance-grid">
                                <div class="performance-metric">
                                    <div class="metric-title">Ticket Distribution</div>
                                    <div class="chart-container">
                                        <div class="distribution-chart">
                                            <div class="chart-bar" style="width: ${calculatePercentage(roleStats['1st-line'].total, roleStats['1st-line'].total + roleStats['2nd-line'].total)}%">
                                                <div class="bar-label">1st Line</div>
                                            </div>
                                            <div class="chart-bar second-line" style="width: ${calculatePercentage(roleStats['2nd-line'].total, roleStats['1st-line'].total + roleStats['2nd-line'].total)}%">
                                                <div class="bar-label">2nd Line</div>
                                            </div>
                                        </div>
                                        <div class="chart-legend">
                                            <div class="legend-item">
                                                <span class="legend-color first-line"></span>
                                                <span>1st Line: ${roleStats['1st-line'].total} tickets (${calculatePercentage(roleStats['1st-line'].total, roleStats['1st-line'].total + roleStats['2nd-line'].total)}%)</span>
                                            </div>
                                            <div class="legend-item">
                                                <span class="legend-color second-line"></span>
                                                <span>2nd Line: ${roleStats['2nd-line'].total} tickets (${calculatePercentage(roleStats['2nd-line'].total, roleStats['1st-line'].total + roleStats['2nd-line'].total)}%)</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                
                                <div class="performance-metric">
                                    <div class="metric-title">Resolution Rate Comparison</div>
                                    <div class="comparison-chart">
                                        <div class="comparison-item">
                                            <span class="comparison-label">1st Line</span>
                                            <div class="comparison-bar-container">
                                                <div class="comparison-bar" style="width: ${calculateRate(roleStats['1st-line'].resolved, roleStats['1st-line'].total)}%"></div>
                                            </div>
                                            <span class="comparison-value">${calculateRate(roleStats['1st-line'].resolved, roleStats['1st-line'].total)}%</span>
                                        </div>
                                        <div class="comparison-item">
                                            <span class="comparison-label">2nd Line</span>
                                            <div class="comparison-bar-container">
                                                <div class="comparison-bar" style="width: ${calculateRate(roleStats['2nd-line'].resolved, roleStats['2nd-line'].total)}%"></div>
                                            </div>
                                            <span class="comparison-value">${calculateRate(roleStats['2nd-line'].resolved, roleStats['2nd-line'].total)}%</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
            } else {
                performanceContainer.innerHTML = '';
            }
        })
        .catch(error => {
            console.error('Error loading performance metrics:', error);
            performanceContainer.innerHTML = '';
        });
}

function calculateRate(part, total) {
    if (!total) return 0;
    return (part / total) * 100;
}