import { CronJob as CronJOB } from 'cron';

export default class CronJob extends CronJOB {
  async stop() {
    if (this._timeout) clearTimeout(this._timeout);
    this.running = false;

    if (!this.waitForCompletion) {
      await this._executeOnComplete();
      return;
    }

    await Promise.resolve().then(async () => {
      await this._waitForJobCompletion();
      await this._executeOnComplete();
    });
  }
}
