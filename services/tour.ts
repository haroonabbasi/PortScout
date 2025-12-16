import { driver } from 'driver.js';
import 'driver.js/dist/driver.css';

// Apply custom dark theme styling (only once)
if (!document.getElementById('driverjs-custom-theme')) {
  const style = document.createElement('style');
  style.id = 'driverjs-custom-theme';
  style.textContent = `
    .driverjs-theme {
      background-color: #111827 !important;
      color: #f3f4f6 !important;
      border: 1px solid #374151 !important;
    }
    .driverjs-theme .driver-popover-title {
      color: #10b981 !important;
      font-weight: 600;
    }
    .driverjs-theme .driver-popover-description {
      color: #d1d5db !important;
    }
    .driverjs-theme .driver-popover-footer {
      border-top: 1px solid #374151 !important;
    }
    .driverjs-theme .driver-popover-btn {
      background-color: #10b981 !important;
      color: white !important;
      border: none !important;
    }
    .driverjs-theme .driver-popover-btn:hover {
      background-color: #059669 !important;
    }
    .driverjs-theme .driver-popover-btn.driver-popover-prev-btn {
      background-color: #374151 !important;
      color: #f3f4f6 !important;
    }
    .driverjs-theme .driver-popover-btn.driver-popover-prev-btn:hover {
      background-color: #4b5563 !important;
    }
    .driverjs-theme .driver-popover-close-btn {
      color: #9ca3af !important;
    }
    .driverjs-theme .driver-popover-close-btn:hover {
      color: #f3f4f6 !important;
    }
    .driverjs-theme .driver-popover-progress-text {
      color: #9ca3af !important;
    }
    .driver-overlay {
      background: rgba(0, 0, 0, 0.75) !important;
    }
    .driver-highlighted-element {
      border: 2px solid #10b981 !important;
      box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.2) !important;
    }
  `;
  document.head.appendChild(style);
}

export const startTour = () => {
  const driverObj = driver({
    showProgress: true,
    showButtons: ['next', 'previous', 'close'],
    steps: [
      {
        element: '[data-tour="path-input"]',
        popover: {
          title: 'Set Your Docker Apps Folder',
          description: 'Set your Docker apps folder here. Add one or more directory paths where your Docker applications are located.',
          side: 'bottom',
          align: 'start',
        },
      },
      {
        element: '[data-tour="scan-button"]',
        popover: {
          title: 'Scan for Open Ports',
          description: 'Click here to find open ports. This will scan your system, Docker containers, and configuration files to identify which ports are in use.',
          side: 'bottom',
          align: 'start',
        },
      },
      {
        element: '[data-tour="port-grid"]',
        popover: {
          title: 'Port Visualization',
          description: 'Green blocks are free ports you can use. The grid shows port status at a glance - green means available, while red, blue, and amber indicate different types of occupied ports.',
          side: 'top',
          align: 'start',
        },
      },
      {
        element: '[data-tour="detail-table"]',
        popover: {
          title: 'Detailed Port Information',
          description: 'See details here. You can Kill processes or Open Docker files directly from this table. Search and filter to find specific ports quickly.',
          side: 'top',
          align: 'start',
        },
      },
      {
        element: '[data-tour="recommended-ports"]',
        popover: {
          title: 'Quick Port Selection',
          description: 'Click a recommended port to copy it instantly. These are free ports that are ready to use for your next project.',
          side: 'left',
          align: 'start',
        },
      },
    ],
    popoverClass: 'driverjs-theme',
    onDestroyStarted: () => {
      driverObj.destroy();
    },
  });

  driverObj.drive();
};

