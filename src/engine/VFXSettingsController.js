// VFXSettingsController.js
// Orchestrates VFX UI modals, local persistence and connects TallGrassSystem and CloudShadowsOverlay.

export class VFXSettingsController {
  constructor(gameApp) {
    this.gameApp = gameApp;

    this.config = {
      cloudSpeed: 22,
      cloudOpacity: 0.22,
      grassSway: 1.0,
      grassParticles: true,
      grassFriction: 0.20
    };

    this.loadSettings();
  }

  loadSettings() {
    try {
      const saved = localStorage.getItem('animal_island_vfx_settings');
      if (saved) {
        this.config = { ...this.config, ...JSON.parse(saved) };
      }
    } catch (e) {
      console.warn('Failed to load VFX settings from localStorage:', e);
    }
    this.applyToSystems();
  }

  saveSettings() {
    try {
      localStorage.setItem('animal_island_vfx_settings', JSON.stringify(this.config));
    } catch (e) {
      console.warn('Failed to save VFX settings to localStorage:', e);
    }
  }

  applyToSystems() {
    if (this.gameApp.cloudShadowsOverlay) {
      this.gameApp.cloudShadowsOverlay.speed = this.config.cloudSpeed;
      this.gameApp.cloudShadowsOverlay.opacity = this.config.cloudOpacity;
    }
    if (this.gameApp.tallGrassSystem) {
      this.gameApp.tallGrassSystem.swayIntensity = this.config.grassSway;
      this.gameApp.tallGrassSystem.particlesEnabled = this.config.grassParticles;
      this.gameApp.tallGrassSystem.speedFriction = this.config.grassFriction;
    }
  }

  bindUI() {
    const btnOpen = document.getElementById('btn-vfx-settings');
    const modal = document.getElementById('modal-vfx-settings');
    const btnClose = document.getElementById('btn-close-vfx-settings');
    const btnSave = document.getElementById('btn-save-vfx-settings');

    const sliderCloudSpeed = document.getElementById('slider-vfx-cloud-speed');
    const sliderCloudOpacity = document.getElementById('slider-vfx-cloud-opacity');
    const sliderGrassSway = document.getElementById('slider-vfx-grass-sway');
    const toggleGrassParticles = document.getElementById('toggle-vfx-grass-particles');
    const sliderGrassFriction = document.getElementById('slider-vfx-grass-friction');

    const labelCloudSpeed = document.getElementById('label-vfx-cloud-speed');
    const labelCloudOpacity = document.getElementById('label-vfx-cloud-opacity');
    const labelGrassSway = document.getElementById('label-vfx-grass-sway');
    const labelGrassFriction = document.getElementById('label-vfx-grass-friction');

    const updateControlsUI = () => {
      if (sliderCloudSpeed) sliderCloudSpeed.value = this.config.cloudSpeed;
      if (sliderCloudOpacity) sliderCloudOpacity.value = Math.round(this.config.cloudOpacity * 100);
      if (sliderGrassSway) sliderGrassSway.value = Math.round(this.config.grassSway * 100);
      if (toggleGrassParticles) toggleGrassParticles.checked = this.config.grassParticles;
      if (sliderGrassFriction) sliderGrassFriction.value = Math.round(this.config.grassFriction * 100);

      if (labelCloudSpeed) labelCloudSpeed.textContent = `${this.config.cloudSpeed} px/s`;
      if (labelCloudOpacity) labelCloudOpacity.textContent = `${Math.round(this.config.cloudOpacity * 100)}%`;
      if (labelGrassSway) labelGrassSway.textContent = `${Math.round(this.config.grassSway * 100)}%`;
      if (labelGrassFriction) labelGrassFriction.textContent = `${Math.round(this.config.grassFriction * 100)}%`;
    };

    if (btnOpen && modal) {
      btnOpen.addEventListener('click', () => {
        updateControlsUI();
        modal.style.display = 'flex';
      });
    }

    if (btnClose && modal) {
      btnClose.addEventListener('click', () => {
        modal.style.display = 'none';
      });
    }

    if (sliderCloudSpeed) {
      sliderCloudSpeed.addEventListener('input', (e) => {
        this.config.cloudSpeed = Number(e.target.value);
        if (labelCloudSpeed) labelCloudSpeed.textContent = `${this.config.cloudSpeed} px/s`;
        this.applyToSystems();
      });
    }

    if (sliderCloudOpacity) {
      sliderCloudOpacity.addEventListener('input', (e) => {
        this.config.cloudOpacity = Number(e.target.value) / 100;
        if (labelCloudOpacity) labelCloudOpacity.textContent = `${e.target.value}%`;
        this.applyToSystems();
      });
    }

    if (sliderGrassSway) {
      sliderGrassSway.addEventListener('input', (e) => {
        this.config.grassSway = Number(e.target.value) / 100;
        if (labelGrassSway) labelGrassSway.textContent = `${e.target.value}%`;
        this.applyToSystems();
      });
    }

    if (toggleGrassParticles) {
      toggleGrassParticles.addEventListener('change', (e) => {
        this.config.grassParticles = e.target.checked;
        this.applyToSystems();
      });
    }

    if (sliderGrassFriction) {
      sliderGrassFriction.addEventListener('input', (e) => {
        this.config.grassFriction = Number(e.target.value) / 100;
        if (labelGrassFriction) labelGrassFriction.textContent = `${e.target.value}%`;
        this.applyToSystems();
      });
    }

    if (btnSave && modal) {
      btnSave.addEventListener('click', () => {
        this.saveSettings();
        modal.style.display = 'none';
        if (typeof this.gameApp.showToast === 'function') {
          this.gameApp.showToast('Configurações de VFX salvas com sucesso!');
        }
      });
    }
  }
}
