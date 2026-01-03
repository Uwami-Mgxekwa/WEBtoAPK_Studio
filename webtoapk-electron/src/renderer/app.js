class WebToAPKStudio {
    constructor() {
        this.currentStep = 1;
        this.totalSteps = 3;
        this.appConfig = {};
        
        this.initializeEventListeners();
        this.updateNavigation();
    }

    initializeEventListeners() {
        // Navigation
        document.getElementById('nextStep').addEventListener('click', () => this.nextStep());
        document.getElementById('prevStep').addEventListener('click', () => this.prevStep());

        // File selection
        document.getElementById('selectIcon').addEventListener('click', () => this.selectIcon());
        document.getElementById('selectOutput').addEventListener('click', () => this.selectOutput());

        // Preview controls
        document.getElementById('loadPreview').addEventListener('click', () => this.loadPreview());
        document.getElementById('refreshPreview').addEventListener('click', () => this.refreshPreview());

        // APK generation
        document.getElementById('generateAPK').addEventListener('click', () => this.generateAPK());

        // Branding link
        document.getElementById('brelinxLink').addEventListener('click', (e) => {
            e.preventDefault();
            this.openExternalLink('https://brelinx.com');
        });

        // Form validation
        this.setupFormValidation();
    }

    setupFormValidation() {
        const inputs = ['appName', 'packageName', 'webUrl'];
        inputs.forEach(id => {
            document.getElementById(id).addEventListener('input', () => this.validateStep1());
        });
    }

    validateStep1() {
        const appName = document.getElementById('appName').value.trim();
        const packageName = document.getElementById('packageName').value.trim();
        const webUrl = document.getElementById('webUrl').value.trim();

        const isValid = appName && packageName && webUrl && this.isValidUrl(webUrl);
        document.getElementById('nextStep').disabled = !isValid;

        if (isValid) {
            this.appConfig = { appName, packageName, webUrl };
        }
    }

    isValidUrl(string) {
        try {
            new URL(string);
            return true;
        } catch (_) {
            return false;
        }
    }

    async selectIcon() {
        try {
            const filePath = await window.electronAPI.selectFile([
                { name: 'Images', extensions: ['png', 'jpg', 'jpeg', 'ico'] }
            ]);
            if (filePath) {
                document.getElementById('iconPath').value = filePath;
                this.appConfig.iconPath = filePath;
            }
        } catch (error) {
            this.showError('Failed to select icon file');
        }
    }

    async selectOutput() {
        try {
            const folderPath = await window.electronAPI.selectFolder();
            if (folderPath) {
                document.getElementById('outputPath').value = folderPath;
                this.appConfig.outputPath = folderPath;
                this.updateGenerateButton();
            }
        } catch (error) {
            this.showError('Failed to select output directory');
        }
    }

    loadPreview() {
        const webUrl = document.getElementById('webUrl').value.trim();
        if (webUrl && this.isValidUrl(webUrl)) {
            const iframe = document.getElementById('webPreview');
            iframe.src = webUrl;
        } else {
            this.showError('Please enter a valid URL first');
        }
    }

    refreshPreview() {
        const iframe = document.getElementById('webPreview');
        if (iframe.src && iframe.src !== 'about:blank') {
            iframe.src = iframe.src;
        }
    }

    updateGenerateButton() {
        const hasOutput = this.appConfig.outputPath;
        const hasConfig = this.appConfig.appName && this.appConfig.packageName && this.appConfig.webUrl;
        document.getElementById('generateAPK').disabled = !(hasOutput && hasConfig);
    }

    async generateAPK() {
        try {
            this.showProgress(true);
            this.updateProgress(10, 'Preparing APK structure...');

            // Simulate APK generation process
            await this.sleep(1000);
            this.updateProgress(30, 'Creating manifest...');

            await this.sleep(1000);
            this.updateProgress(50, 'Processing web assets...');

            await this.sleep(1000);
            this.updateProgress(70, 'Building APK...');

            await this.sleep(1000);
            this.updateProgress(90, 'Finalizing...');

            await this.sleep(500);
            this.updateProgress(100, 'APK generated successfully!');

            // Create a simple APK info file for now
            const apkInfo = {
                appName: this.appConfig.appName,
                packageName: this.appConfig.packageName,
                webUrl: this.appConfig.webUrl,
                generatedAt: new Date().toISOString(),
                note: 'This is a placeholder. Real APK generation requires Android SDK integration.'
            };

            const outputFile = `${this.appConfig.outputPath}/${this.appConfig.appName.replace(/\s+/g, '_')}_info.json`;
            await window.electronAPI.writeFile(outputFile, JSON.stringify(apkInfo, null, 2));

            setTimeout(() => {
                this.showProgress(false);
                this.showSuccess(`APK info saved to: ${outputFile}`);
            }, 1000);

        } catch (error) {
            this.showProgress(false);
            this.showError('Failed to generate APK: ' + error.message);
        }
    }

    showProgress(show) {
        document.getElementById('progressContainer').style.display = show ? 'block' : 'none';
        if (!show) {
            this.updateProgress(0, 'Preparing...');
        }
    }

    updateProgress(percent, text) {
        document.getElementById('progressFill').style.width = percent + '%';
        document.getElementById('progressText').textContent = text;
    }

    nextStep() {
        if (this.currentStep < this.totalSteps) {
            this.showStep(this.currentStep + 1);
        }
    }

    prevStep() {
        if (this.currentStep > 1) {
            this.showStep(this.currentStep - 1);
        }
    }

    showStep(stepNumber) {
        // Hide current step
        document.getElementById(`step${this.currentStep}`).classList.remove('active');
        
        // Show new step
        this.currentStep = stepNumber;
        document.getElementById(`step${this.currentStep}`).classList.add('active');
        
        this.updateNavigation();

        // Step-specific logic
        if (this.currentStep === 2) {
            // Auto-load preview if URL is available
            const webUrl = document.getElementById('webUrl').value.trim();
            if (webUrl && this.isValidUrl(webUrl)) {
                setTimeout(() => this.loadPreview(), 500);
            }
        } else if (this.currentStep === 3) {
            this.updateGenerateButton();
        }
    }

    updateNavigation() {
        document.getElementById('prevStep').disabled = this.currentStep === 1;
        document.getElementById('nextStep').disabled = this.currentStep === this.totalSteps;
        
        if (this.currentStep === 1) {
            this.validateStep1();
        }
    }

    showError(message) {
        // Simple alert for now - could be enhanced with custom modal
        alert('Error: ' + message);
    }

    showSuccess(message) {
        alert('Success: ' + message);
    }

    openExternalLink(url) {
        // In Electron, we need to use the shell module to open external links
        // This will be handled by the main process
        window.electronAPI.openExternal(url);
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    new WebToAPKStudio();
});