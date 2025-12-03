import * as bcrypt from "bcrypt";

export class LxCryptUtil {
  constructor(){
    
  }
  //-------------------------------------------------
  lxGetSalt(rounds: number): string {
    return bcrypt.genSaltSync(rounds);
  }
  //-------------------------------------------------
  lxGetSaltAsynchronous(
    rounds: number,
    callback: ((err: Error, salt: string) => void)
  ): void {
    bcrypt.genSalt(rounds);
  }
  //-------------------------------------------------
  lxBCryptHashGet(rounds: number, passw: string): string {
    return bcrypt.hashSync(passw, this.lxGetSalt(rounds));
  }
  //-------------------------------------------------
  lxBCryptHashGetAsynchronous(
    rounds: number,
    passw: string,
    callback: ((err: Error, hash: string) => void)
  ): void {
      this.lxGetSaltAsynchronous(rounds, (err: Error, salt: string) => {
      bcrypt.hash(passw, salt);
    });
  }
  //-------------------------------------------------
  lxBCryptHashCompare(passw: string, hash: string): boolean {
    return bcrypt.compareSync(passw, hash);
  }
  //-------------------------------------------------
  lxBCryptHashCompareAsynchronous(
    passw: string,
    hash: string,
    callback: ((err: Error, isMatch: boolean) => void)
  ): void {
    bcrypt.compare(passw, hash);
  }
  //-------------------------------------------------
}