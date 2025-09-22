export class ComplianceService {
  sanctionedWallets: string[] = ["wasm12gcpk8rsezs5lfjq2xmp0rd69e6k8gx02u7yv5"];
  mixerWallets: string[] = [];
  darknetWallets: string[] = [];

  isSanctioned(address: string): boolean {
    return this.sanctionedWallets.includes(address);
  }
  addSanctioned(address: string): boolean {
    if (this.isSanctioned(address)) return false;
    this.sanctionedWallets.push(address);
    return true;
  }

  isMixer(address: string): boolean {
    return this.mixerWallets.includes(address);
  }
  addMixer(address: string): boolean {
    if (this.isMixer(address)) return false;
    this.mixerWallets.push(address);
    return true;
  }

  isDarknet(address: string): boolean {
    return this.darknetWallets.includes(address);
  }
  addDarknet(address: string): boolean {
    if (this.isDarknet(address)) return false;
    this.darknetWallets.push(address);
    return true;
  }
}
