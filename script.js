document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements - Select safely
  const themeToggle = document.getElementById('themeToggle');
  const body = document.body;
  const sidebar = document.querySelector('.sidebar');
  const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
  const uploadBtn = document.querySelector('.add-new-btn');
  const uploadOverlay = document.querySelector('.upload-overlay');
  const closeUploadBtn = document.querySelector('.close-upload');
  const navLinks = document.querySelectorAll('.nav-links li');
  const dropZone = document.querySelector('.drop-zone');
  const filesTableBody = document.querySelector('.files-table tbody');

  // --- Theme Handling ---
  // If no themeToggle exists (e.g. simple auth pages), just apply saved theme
  const savedTheme = localStorage.getItem('theme') || 'light';
  body.setAttribute('data-theme', savedTheme);

  if (themeToggle) {
    updateThemeIcon(savedTheme);

    themeToggle.addEventListener('click', () => {
      const currentTheme = body.getAttribute('data-theme');
      const newTheme = currentTheme === 'light' ? 'dark' : 'light';

      body.setAttribute('data-theme', newTheme);
      localStorage.setItem('theme', newTheme);
      updateThemeIcon(newTheme);
    });

    function updateThemeIcon(theme) {
      const icon = themeToggle.querySelector('i');
      if (theme === 'dark') {
        icon.classList.remove('fa-moon');
        icon.classList.add('fa-sun');
      } else {
        icon.classList.remove('fa-sun');
        icon.classList.add('fa-moon');
      }
    }
  }

  // --- Mobile Sidebar ---
  if (mobileMenuToggle && sidebar) {
    mobileMenuToggle.addEventListener('click', () => {
      sidebar.classList.toggle('active');
    });

    // Close sidebar when clicking outside on mobile
    document.addEventListener('click', (e) => {
      if (window.innerWidth <= 768) {
        if (!sidebar.contains(e.target) && !mobileMenuToggle.contains(e.target) && sidebar.classList.contains('active')) {
          sidebar.classList.remove('active');
        }
      }
    });
  }

  // --- Navigation Active State ---
  if (navLinks.length > 0) {
    navLinks.forEach(link => {
      link.addEventListener('click', function () {
        // Remove active from all
        navLinks.forEach(l => l.classList.remove('active'));
        // Add to clicked (skip spacer)
        if (!this.classList.contains('spacer')) {
          this.classList.add('active');
        }
      });
    });
  }

  // --- Upload Modal Handling ---
  if (uploadBtn && uploadOverlay && closeUploadBtn) {
    uploadBtn.addEventListener('click', () => {
      uploadOverlay.classList.remove('hidden');
      // Small delay to allow display:block to apply before opacity transition
      setTimeout(() => {
        uploadOverlay.classList.add('active');
      }, 10);
    });

    const closeUpload = () => {
      uploadOverlay.classList.remove('active');
      setTimeout(() => {
        uploadOverlay.classList.add('hidden');
      }, 300);
    };

    closeUploadBtn.addEventListener('click', closeUpload);
    uploadOverlay.addEventListener('click', (e) => {
      if (e.target === uploadOverlay) closeUpload();
    });

    // --- File Upload Simulation ---
    if (dropZone) {
      dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.style.borderColor = 'var(--accent-color)';
        dropZone.style.backgroundColor = 'rgba(79, 70, 229, 0.1)';
      });

      dropZone.addEventListener('dragleave', (e) => {
        e.preventDefault();
        dropZone.style.borderColor = 'var(--glass-border)';
        dropZone.style.backgroundColor = 'transparent';
      });

      dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.style.borderColor = 'var(--glass-border)';
        dropZone.style.backgroundColor = 'transparent';

        const files = e.dataTransfer.files;
        if (files.length > 0) {
          handleFiles(files);
        }
      });

      dropZone.addEventListener('click', () => {
        // Create a hidden file input
        const input = document.createElement('input');
        input.type = 'file';
        input.multiple = true;
        input.onchange = (e) => {
          handleFiles(e.target.files);
        };
        input.click();
      });

      function handleFiles(files) {
        // Close modal
        closeUpload();

        // Simulate upload delay for each file
        Array.from(files).forEach(file => {
          // Visualize "Uploading..." (In a real app, this would be a toast)
          console.log(`Uploading ${file.name}...`);

          if (filesTableBody) {
            setTimeout(() => {
              addFileToTable(file);
            }, 1000 + Math.random() * 1000); // Random delay 1-2s
          }
        });
      }
    }
  }

  function addFileToTable(file) {
    if (!filesTableBody) return;

    const row = document.createElement('tr');

    // Determine icon based on type
    let iconClass = 'fa-file';
    let colorClass = '';

    if (file.type.includes('image')) {
      iconClass = 'fa-image';
      colorClass = 'image-icon';
    } else if (file.type.includes('pdf')) {
      iconClass = 'fa-file-pdf';
      colorClass = 'pdf-icon';
    } else if (file.type.includes('javascript') || file.type.includes('json') || file.type.includes('html')) {
      iconClass = 'fa-code';
      colorClass = 'js-icon';
    } else if (file.type.includes('video')) {
      iconClass = 'fa-video';
      colorClass = 'pdf-icon'; // Reuse red for video
    }

    const size = formatSize(file.size);
    const date = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

    row.innerHTML = `
            <td class="file-name">
                <i class="fa-solid ${iconClass} ${colorClass}"></i>
                <span>${file.name}</span>
            </td>
            <td>${size}</td>
            <td>${file.type.split('/')[1] || 'File'}</td>
            <td>${date}</td>
            <td><button class="action-btn"><i class="fa-solid fa-ellipsis"></i></button></td>
        `;

    // Add visual animation
    row.style.animation = 'fadeIn 0.5s ease';

    // Insert at top
    filesTableBody.insertBefore(row, filesTableBody.firstChild);
  }

  function formatSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // --- Logout Confirmation ---
  const logoutLinks = document.querySelectorAll('a[href="login.html"]');
  logoutLinks.forEach(link => {
    // Only apply to logout links (not the login page itself)
    if (link.textContent.includes('Logout') || link.querySelector('.fa-arrow-right-from-bracket')) {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        if (confirm('Are you sure you want to logout?')) {
          window.location.href = 'login.html';
        }
      });
    }
  });

  // --- Profile Save Button ---
  const saveButtons = document.querySelectorAll('button[type="button"]');
  saveButtons.forEach(btn => {
    if (btn.textContent.includes('Save Changes')) {
      btn.addEventListener('click', () => {
        alert('Profile settings saved successfully! ✓');
      });
    }
  });
});

// Add Keyframes for fade in js-created elements
const style = document.createElement('style');
style.innerHTML = `
    @keyframes fadeIn {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
    }
`;
document.head.appendChild(style);