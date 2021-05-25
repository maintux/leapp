import {SessionType} from './session-type';
import {Session} from './session';

export class AwsTrusterSession extends Session {
  region: string;
  roleArn: string;
  type: SessionType;
  profileId: string;
  parentSessionId: string;

  constructor(sessionName: string, region: string, roleArn: string, profileId: string, parentSessionId: string) {
    super(sessionName, region);

    this.roleArn = roleArn;
    this.profileId = profileId;
    this.parentSessionId = parentSessionId;
    this.type = SessionType.awsTruster;
  }
}
