// Day / Night Cycle and Action Points (AP) System (Brasília Time: 06h-17h Day / 17h01-05h59 Night)

export class DayNightSystem {
  constructor(options = {}) {
    // Timezone: America/Sao_Paulo (Brasília)
    this.timeZone = options.timeZone || 'America/Sao_Paulo';
    this.useSimulatedTime = options.useSimulatedTime || false;
    this.simulatedHour = options.simulatedHour || 10;
    this.simulatedMinute = options.simulatedMinute || 0;

    // Action Points Configuration
    this.maxBaseAP = 5;
    this.maxUnlockedAP = 10;
    this.currentMaxAP = options.currentMaxAP || 5;
    this.currentAP = options.currentAP !== undefined ? options.currentAP : 5;

    // Hero Perks (e.g., Vampire Bat "Eco Noturno" bonus)
    this.activeHeroId = options.activeHeroId || 'char_wolf_hunter_m';
    this.nightAPBonus = 0; // Granted to Vampire Bat

    // Event listeners
    this.listeners = [];
  }

  setHero(heroId) {
    this.activeHeroId = heroId;
    this.updateVampireBonus();
    this.notify();
  }

  updateVampireBonus() {
    const isVampire = this.activeHeroId === 'char_bat_vampire_m' || this.activeHeroId === 'char_bat_vampire_f';
    const isNight = this.isNight();
    if (isVampire && isNight) {
      this.nightAPBonus = 5;
    } else {
      this.nightAPBonus = 0;
    }
  }

  // Get current Brasília time (or simulated)
  getCurrentTime() {
    if (this.useSimulatedTime) {
      return {
        hours: this.simulatedHour,
        minutes: this.simulatedMinute,
        formatted: `${String(this.simulatedHour).padStart(2, '0')}:${String(this.simulatedMinute).padStart(2, '0')}`
      };
    }

    try {
      const now = new Date();
      const brTimeStr = now.toLocaleTimeString('en-US', { timeZone: this.timeZone, hour12: false, hour: '2-digit', minute: '2-digit' });
      const [h, m] = brTimeStr.split(':').map(Number);
      return {
        hours: h,
        minutes: m,
        formatted: `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
      };
    } catch {
      const now = new Date();
      return {
        hours: now.getHours(),
        minutes: now.getMinutes(),
        formatted: `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
      };
    }
  }

  // Day: 06:00 to 17:00 (Brasília)
  // Night: 17:01 to 05:59 (Brasília)
  isDay() {
    const { hours, minutes } = this.getCurrentTime();
    const totalMinutes = hours * 60 + minutes;
    return totalMinutes >= 6 * 60 && totalMinutes <= 17 * 60;
  }

  isNight() {
    return !this.isDay();
  }

  // Progress through current cycle (0.0 to 1.0) for radial dial positioning
  // 06:00 is 0.0 (Sunrise), 12:00 is 0.25 (Midday), 17:00 is 0.5 (Sunset), 23:30 is 0.75 (Midnight), 05:59 is 1.0
  getCycleProgress() {
    const { hours, minutes } = this.getCurrentTime();
    const totalMinutes = (hours * 60 + minutes);
    // Offset so 06:00 is 0
    let offsetMinutes = totalMinutes - (6 * 60);
    if (offsetMinutes < 0) offsetMinutes += 24 * 60;
    return offsetMinutes / (24 * 60);
  }

  // Action Points Management
  getTotalAvailableAP() {
    return this.currentAP + this.nightAPBonus;
  }

  canPerformAction() {
    const isVampire = this.activeHeroId === 'char_bat_vampire_m' || this.activeHeroId === 'char_bat_vampire_f';
    const isNight = this.isNight();

    // At night, only Vampire bats can act, unless special lantern buff is active
    if (isNight && !isVampire) {
      return { allowed: false, reason: 'É noite! Apenas Morcegos Vampiros possuem a habilidade Eco Noturno para agir no escuro. Descanse ou use uma tocha/dragão luminoso.' };
    }

    if (this.getTotalAvailableAP() <= 0) {
      return { allowed: false, reason: 'Pontos de Ação (AP) esgotados! Suas ações diárias se renovam no próximo ciclo às 06h de Brasília.' };
    }

    return { allowed: true };
  }

  consumeAction(amount = 1) {
    const check = this.canPerformAction();
    if (!check.allowed) return check;

    if (this.nightAPBonus > 0) {
      this.nightAPBonus = Math.max(0, this.nightAPBonus - amount);
    } else {
      this.currentAP = Math.max(0, this.currentAP - amount);
    }

    this.notify();
    return { allowed: true, remainingAP: this.getTotalAvailableAP() };
  }

  restoreAP(amount = 1) {
    this.currentAP = Math.min(this.currentMaxAP, this.currentAP + amount);
    this.notify();
  }

  resetDailyAP() {
    this.currentAP = this.currentMaxAP;
    this.updateVampireBonus();
    this.notify();
  }

  upgradeMaxAP() {
    if (this.currentMaxAP < this.maxUnlockedAP) {
      this.currentMaxAP++;
      this.currentAP = this.currentMaxAP;
      this.notify();
      return true;
    }
    return false;
  }

  // Get ambient lighting tint based on time of day
  getAmbientLight() {
    const { hours } = this.getCurrentTime();
    if (hours >= 6 && hours < 8) {
      // Dawn (soft warm golden orange)
      return { r: 255, g: 200, b: 150, alpha: 0.10, name: 'Amanhecer' };
    } else if (hours >= 8 && hours < 16) {
      // Broad Daylight (crystal clear)
      return { r: 255, g: 255, b: 255, alpha: 0.0, name: 'Dia' };
    } else if (hours >= 16 && hours <= 17) {
      // Golden Hour / Sunset (warm amber purple)
      return { r: 250, g: 150, b: 100, alpha: 0.12, name: 'Entardecer' };
    } else if (hours > 17 && hours < 20) {
      // Dusk / Twilight (soft moonlit deep indigo)
      return { r: 70, g: 80, b: 150, alpha: 0.18, name: 'Crepúsculo' };
    } else {
      // Deep Night (magical starlit blue with high contrast)
      return { r: 50, g: 65, b: 130, alpha: 0.25, name: 'Noite' };
    }
  }

  subscribe(listener) {
    this.listeners.push(listener);
    listener(this);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  notify() {
    this.listeners.forEach(fn => fn(this));
  }
}
