class WebToAPKStudio {
    constructor() {
        this.currentScreen = 'dashboard';
        this.currentWizardStep = 1;
        this.totalWizardSteps = 4;
        this.projects = this.loadProjects();
        this.currentProject = null;
        
        this.initializeEventListeners();
        this.renderProjects();
        this.updateWizardNavigation();
    }

    initializeEventListeners() {
        // Dashboard events
        document.getElementById('createNewApp').addEventListener('click', () => this.startNewProject());
        document.getElementById('settingsBtn').addEventListener('click', () => this.showSettings());
        document.getElementById('profileBtn').addEventListener('click', () => this.showProfile());

        // Wizard navigation
        document.getElementById('backToDashboard').addEventListener('click', () => this.showScreen('dashboard'));
        document.getElementById('wizardBack').addEventListener('click', () => this.previousWizardStep());
        document.getElementById('wizardNext').addEventListener('click', () => this.nextWizardStep());

        // Step 1 events
        document.getElementById('verifyUrl').addEventListener('click', () => this.verifyUrl());
        document.getElementById('websiteUrl').addEventListener('input', () => this.onUrlChange());
        document.getElementById('appName').addEventListener('input', () => this.onAppNameChange());
        document.getElementById('customPackage').addEventListener('change', () => this.toggleCustomPackage());

        // Step 2 events
        document.getElementById('uploadIcon').addEventListener('click', () => this.uploadIcon());
        document.getElementById('uploadSplash').addEventListener('click', () => this.uploadSplash());

        // Step 4 events
        document.getElementById('enableAds').addEventListener('change', () => this.toggleAdsConfig());

        // Build events
        document.getElementById('toggleLog').addEventListener('click', () => this.toggleBuildLog());
        document.getElementById('retryBuild').addEventListener('click', () => this.startBuild());

        // Branding link
        document.getElementById('brelinxLink').addEventListener('click', (e) => {
            e.preventDefault();
            this.openExternalLink('https://brelinx.com');
        });

        // Form validation
        this.setupFormValidation();
    }

    setupFormValidation() {
        const requiredFields = ['websiteUrl', 'appName', 'packageName'];
        requiredFields.forEach(id => {
            document.getElementById(id).addEventListener('input', () => this.validateCurrentStep());
        });
    }

    // Screen Management
    showScreen(screenName) {
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
        document.getElementById(screenName + 'Screen').classList.add('active');
        this.currentScreen = screenName;
    }

    // Project Management
    loadProjects() {
        const saved = localStorage.getItem('webtoapk_projects');
        return saved ? JSON.parse(saved) : [];
    }

    saveProjects() {
        localStorage.setItem('webtoapk_projects', JSON.stringify(this.projects));
    }

    renderProjects() {
        const grid = document.getElementById('projectsGrid');
        
        if (this.projects.length === 0) {
            grid.innerHTML = `
                <div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: #666666;">
                    <p>No projects yet. Create your first app to get started!</p>
                </div>
            `;
            return;
        }

        grid.innerHTML = this.projects.map(project => `
            <div class="project-card">
                <div class="project-header">
                    <div class="project-icon">
                        ${project.icon ? `<img src="${project.icon}" alt="Icon" style="width: 100%; height: 100%; object-fit: cover;">` : 'Icon'}
                    </div>
                    <div class="project-info">
                        <h3>${project.appName}</h3>
                        <p>${project.packageName}</p>
                    </div>
                </div>
                <div class="project-status status-${project.status}">
                    ${project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                </div>
                <div class="project-actions">
                    <button class="project-btn" onclick="app.editProject('${project.id}')">Edit</button>
                    ${project.status === 'completed' ? 
                        `<button class="project-btn primary" onclick="app.downloadProject('${project.id}')">Download</button>` :
                        `<button class="project-btn primary" onclick="app.buildProject('${project.id}')">Build</button>`
                    }
                </div>
            </div>
        `).join('');
    }

    startNewProject() {
        this.currentProject = {
            id: Date.now().toString(),
            appName: '',
            packageName: '',
            websiteUrl: '',
            versionNumber: '1.0.0',
            status: 'draft',
            createdAt: new Date().toISOString(),
            config: {
                icon: null,
                splash: null,
                splashBgColor: '#ffffff',
                primaryColor: '#22c55e',
                statusBarColor: '#16a34a',
                showNavBar: false,
                pullToRefresh: true,
                offlineMode: false,
                offlineMessage: 'Please check your internet connection',
                permissions: {
                    camera: false,
                    location: false,
                    storage: false,
                    microphone: false
                },
                userAgent: '',
                zoomControls: false,
                enableAds: false,
                admobAppId: '',
                bannerAdUnit: '',
                interstitialAdUnit: '',
                bannerPosition: 'bottom'
            }
        };
        
        this.resetWizardForm();
        this.showScreen('wizard');
        this.showWizardStep(1);
    }

    editProject(projectId) {
        const project = this.projects.find(p => p.id === projectId);
        if (project) {
            this.currentProject = { ...project };
            this.populateWizardForm();
            this.showScreen('wizard');
            this.showWizardStep(1);
        }
    }

    buildProject(projectId) {
        const project = this.projects.find(p => p.id === projectId);
        if (project) {
            this.currentProject = { ...project };
            this.showScreen('build');
            this.startBuild();
        }
    }

    downloadProject(projectId) {
        // Simulate download
        this.showSuccess('APK download started!');
    }

    // Wizard Management
    showWizardStep(stepNumber) {
        // Hide all steps
        document.querySelectorAll('.wizard-step').forEach(step => {
            step.classList.remove('active');
        });
        
        // Show current step
        document.getElementById(`wizardStep${stepNumber}`).classList.add('active');
        
        // Update progress indicators
        document.querySelectorAll('.progress-step').forEach((step, index) => {
            step.classList.remove('active', 'completed');
            if (index + 1 < stepNumber) {
                step.classList.add('completed');
            } else if (index + 1 === stepNumber) {
                step.classList.add('active');
            }
        });
        
        this.currentWizardStep = stepNumber;
        this.updateWizardNavigation();
    }

    nextWizardStep() {
        if (this.validateCurrentStep()) {
            if (this.currentWizardStep < this.totalWizardSteps) {
                this.showWizardStep(this.currentWizardStep + 1);
            } else {
                this.finishWizard();
            }
        }
    }

    previousWizardStep() {
        if (this.currentWizardStep > 1) {
            this.showWizardStep(this.currentWizardStep - 1);
        }
    }

    updateWizardNavigation() {
        const backBtn = document.getElementById('wizardBack');
        const nextBtn = document.getElementById('wizardNext');
        
        backBtn.disabled = this.currentWizardStep === 1;
        
        const stepLabels = ['Next: Branding', 'Next: Features', 'Next: Monetization', 'Build App'];
        nextBtn.textContent = stepLabels[this.currentWizardStep - 1];
        
        nextBtn.disabled = !this.validateCurrentStep();
    }

    validateCurrentStep() {
        switch (this.currentWizardStep) {
            case 1:
                const url = document.getElementById('websiteUrl').value.trim();
                const appName = document.getElementById('appName').value.trim();
                const packageName = document.getElementById('packageName').value.trim();
                return url && appName && packageName && this.isValidUrl(url);
            case 2:
            case 3:
            case 4:
                return true;
            default:
                return false;
        }
    }

    finishWizard() {
        this.saveCurrentProject();
        this.showScreen('build');
        this.startBuild();
    }

    // Form Handling
    resetWizardForm() {
        document.getElementById('websiteUrl').value = '';
        document.getElementById('appName').value = '';
        document.getElementById('packageName').value = '';
        document.getElementById('versionNumber').value = '1.0.0';
        document.getElementById('customPackage').checked = false;
        document.getElementById('packageName').disabled = true;
        
        // Reset other form fields...
        this.clearUrlStatus();
    }

    populateWizardForm() {
        if (!this.currentProject) return;
        
        document.getElementById('websiteUrl').value = this.currentProject.websiteUrl || '';
        document.getElementById('appName').value = this.currentProject.appName || '';
        document.getElementById('packageName').value = this.currentProject.packageName || '';
        document.getElementById('versionNumber').value = this.currentProject.versionNumber || '1.0.0';
        
        // Populate other fields from config...
    }

    saveCurrentProject() {
        if (!this.currentProject) return;
        
        // Update project with form values
        this.currentProject.websiteUrl = document.getElementById('websiteUrl').value.trim();
        this.currentProject.appName = document.getElementById('appName').value.trim();
        this.currentProject.packageName = document.getElementById('packageName').value.trim();
        this.currentProject.versionNumber = document.getElementById('versionNumber').value.trim();
        
        // Save config from other steps...
        this.saveFormConfig();
        
        // Add or update in projects array
        const existingIndex = this.projects.findIndex(p => p.id === this.currentProject.id);
        if (existingIndex >= 0) {
            this.projects[existingIndex] = this.currentProject;
        } else {
            this.projects.push(this.currentProject);
        }
        
        this.saveProjects();
    }

    saveFormConfig() {
        if (!this.currentProject) return;
        
        // Save Step 2 config
        this.currentProject.config.splashBgColor = document.getElementById('splashBgColor').value;
        this.currentProject.config.primaryColor = document.getElementById('primaryColor').value;
        this.currentProject.config.statusBarColor = document.getElementById('statusBarColor').value;
        
        // Save Step 3 config
        this.currentProject.config.showNavBar = document.getElementById('showNavBar').checked;
        this.currentProject.config.pullToRefresh = document.getElementById('pullToRefresh').checked;
        this.currentProject.config.offlineMode = document.getElementById('offlineMode').checked;
        this.currentProject.config.offlineMessage = document.getElementById('offlineMessage').value;
        this.currentProject.config.permissions.camera = document.getElementById('permCamera').checked;
        this.currentProject.config.permissions.location = document.getElementById('permLocation').checked;
        this.currentProject.config.permissions.storage = document.getElementById('permStorage').checked;
        this.currentProject.config.permissions.microphone = document.getElementById('permMicrophone').checked;
        this.currentProject.config.userAgent = document.getElementById('userAgent').value;
        this.currentProject.config.zoomControls = document.getElementById('zoomControls').checked;
        
        // Save Step 4 config
        this.currentProject.config.enableAds = document.getElementById('enableAds').checked;
        if (this.currentProject.config.enableAds) {
            this.currentProject.config.admobAppId = document.getElementById('admobAppId').value;
            this.currentProject.config.bannerAdUnit = document.getElementById('bannerAdUnit').value;
            this.currentProject.config.interstitialAdUnit = document.getElementById('interstitialAdUnit').value;
            const bannerPosition = document.querySelector('input[name="bannerPosition"]:checked');
            this.currentProject.config.bannerPosition = bannerPosition ? bannerPosition.value : 'bottom';
        }
    }

    // Step 1 Functions
    async verifyUrl() {
        const url = document.getElementById('websiteUrl').value.trim();
        if (!url) {
            this.showUrlStatus('Please enter a URL first', 'error');
            return;
        }
        
        if (!this.isValidUrl(url)) {
            this.showUrlStatus('Please enter a valid URL (must start with http:// or https://)', 'error');
            return;
        }
        
        this.showUrlStatus('Verifying URL...', 'loading');
        
        // Simulate URL verification
        setTimeout(() => {
            this.showUrlStatus('✓ URL is accessible', 'success');
        }, 1500);
    }

    onUrlChange() {
        this.clearUrlStatus();
        this.updateWizardNavigation();
    }

    onAppNameChange() {
        const appName = document.getElementById('appName').value.trim();
        const customPackage = document.getElementById('customPackage').checked;
        
        if (!customPackage && appName) {
            const packageName = 'com.w2a.' + appName.toLowerCase().replace(/[^a-z0-9]/g, '');
            document.getElementById('packageName').value = packageName;
        }
        
        this.updateWizardNavigation();
    }

    toggleCustomPackage() {
        const customPackage = document.getElementById('customPackage').checked;
        const packageInput = document.getElementById('packageName');
        
        packageInput.disabled = !customPackage;
        
        if (!customPackage) {
            this.onAppNameChange(); // Auto-generate package name
        }
    }

    showUrlStatus(message, type) {
        const statusDiv = document.getElementById('urlStatus');
        statusDiv.textContent = message;
        statusDiv.className = `url-status ${type}`;
        statusDiv.style.display = 'block';
    }

    clearUrlStatus() {
        const statusDiv = document.getElementById('urlStatus');
        statusDiv.style.display = 'none';
    }

    // Step 2 Functions
    async uploadIcon() {
        try {
            if (!window.electronAPI || !window.electronAPI.selectFile) {
                this.showError('File selection not available in this environment');
                return;
            }
            
            const filePath = await window.electronAPI.selectFile([
                { name: 'Images', extensions: ['png', 'jpg', 'jpeg'] }
            ]);
            if (filePath) {
                const preview = document.getElementById('iconPreview');
                preview.innerHTML = `<img src="file://${filePath}" alt="Icon" style="width: 100%; height: 100%; object-fit: cover; border-radius: 4px;">`;
                if (this.currentProject) {
                    this.currentProject.config.icon = filePath;
                }
            }
        } catch (error) {
            this.showError('Failed to select icon file: ' + error.message);
        }
    }

    async uploadSplash() {
        try {
            if (!window.electronAPI || !window.electronAPI.selectFile) {
                this.showError('File selection not available in this environment');
                return;
            }
            
            const filePath = await window.electronAPI.selectFile([
                { name: 'Images', extensions: ['png', 'jpg', 'jpeg'] }
            ]);
            if (filePath) {
                const preview = document.getElementById('splashPreview');
                preview.innerHTML = `<img src="file://${filePath}" alt="Splash" style="width: 100%; height: 100%; object-fit: cover; border-radius: 4px;">`;
                if (this.currentProject) {
                    this.currentProject.config.splash = filePath;
                }
            }
        } catch (error) {
            this.showError('Failed to select splash image: ' + error.message);
        }
    }

    // Step 4 Functions
    toggleAdsConfig() {
        const enableAds = document.getElementById('enableAds').checked;
        const adsConfig = document.getElementById('adsConfig');
        adsConfig.style.display = enableAds ? 'block' : 'none';
    }

    // Build Functions
    async startBuild() {
        if (!this.currentProject) return;
        
        this.currentProject.status = 'building';
        this.saveProjects();
        
        // Reset build UI
        document.getElementById('buildActions').style.display = 'none';
        document.getElementById('buildError').style.display = 'none';
        document.getElementById('logContent').style.display = 'none';
        document.getElementById('toggleLog').textContent = 'Show Details';
        
        const progressCircle = document.getElementById('buildProgress');
        const statusText = document.getElementById('buildStatusText');
        const logMessages = document.getElementById('logMessages');
        
        progressCircle.style.animation = 'spin 2s linear infinite';
        logMessages.innerHTML = '';
        
        const buildSteps = [
            { progress: 10, status: 'Initializing build environment...', log: 'Setting up Android SDK tools...' },
            { progress: 25, status: 'Creating Android project...', log: 'Generating AndroidManifest.xml...' },
            { progress: 40, status: 'Processing web assets...', log: 'Downloading website resources...' },
            { progress: 55, status: 'Configuring WebView...', log: 'Setting up WebView configuration...' },
            { progress: 70, status: 'Compiling resources...', log: 'Running aapt2 resource compiler...' },
            { progress: 85, status: 'Building APK...', log: 'Assembling APK package...' },
            { progress: 95, status: 'Signing APK...', log: 'Applying digital signature...' },
            { progress: 100, status: 'Build completed successfully!', log: 'APK ready for download!' }
        ];
        
        for (let i = 0; i < buildSteps.length; i++) {
            await this.sleep(1500);
            const step = buildSteps[i];
            
            document.querySelector('.progress-text').textContent = step.progress + '%';
            statusText.textContent = step.status;
            
            logMessages.innerHTML += `<div>[${new Date().toLocaleTimeString()}] ${step.log}</div>`;
            logMessages.scrollTop = logMessages.scrollHeight;
            
            if (step.progress === 100) {
                progressCircle.style.animation = 'none';
                progressCircle.style.borderColor = '#22c55e';
                this.currentProject.status = 'completed';
                this.saveProjects();
                this.renderProjects();
                document.getElementById('buildActions').style.display = 'flex';
            }
        }
    }

    toggleBuildLog() {
        const logContent = document.getElementById('logContent');
        const toggleBtn = document.getElementById('toggleLog');
        
        if (logContent.style.display === 'none') {
            logContent.style.display = 'block';
            toggleBtn.textContent = 'Hide Details';
        } else {
            logContent.style.display = 'none';
            toggleBtn.textContent = 'Show Details';
        }
    }

    // Utility Functions
    isValidUrl(string) {
        try {
            const url = new URL(string);
            return url.protocol === 'http:' || url.protocol === 'https:';
        } catch (_) {
            return false;
        }
    }

    openExternalLink(url) {
        try {
            if (window.electronAPI && window.electronAPI.openExternal) {
                window.electronAPI.openExternal(url);
            } else {
                // Fallback for development or if electronAPI is not available
                console.warn('electronAPI not available, opening in browser');
                window.open(url, '_blank');
            }
        } catch (error) {
            console.error('Failed to open external link:', error);
            // Fallback to window.open
            window.open(url, '_blank');
        }
    }

    showSettings() {
        this.showInfo('Settings panel coming soon!');
    }

    showProfile() {
        this.showInfo('Profile panel coming soon!');
    }

    showError(message) {
        alert('Error: ' + message);
    }

    showSuccess(message) {
        alert('Success: ' + message);
    }

    showInfo(message) {
        alert('Info: ' + message);
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Initialize the application
let app;
document.addEventListener('DOMContentLoaded', () => {
    // Debug: Check what's available in window
    console.log('Window object keys:', Object.keys(window));
    console.log('electronAPI available:', typeof window.electronAPI);
    console.log('electronAPI object:', window.electronAPI);
    
    // Check if electronAPI is available
    if (typeof window.electronAPI === 'undefined') {
        console.warn('electronAPI not available - some features may not work');
        console.log('Running in development mode or preload script failed to load');
    } else {
        console.log('electronAPI loaded successfully');
    }
    
    app = new WebToAPKStudio();
});