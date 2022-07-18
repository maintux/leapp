import { jest, describe, test, expect, beforeEach } from "@jest/globals";
import { AwsIamRoleFederatedSession } from "../../../models/aws/aws-iam-role-federated-session";
import { AwsIamRoleFederatedService } from "./aws-iam-role-federated-service";
import { SessionType } from "../../../models/session-type";
import { AwsIamRoleFederatedSessionRequest } from "./aws-iam-role-federated-session-request";
import * as uuid from "uuid";
jest.mock("uuid");

describe("AwsIamRoleFederatedService", () => {
  beforeEach(() => {});

  test("getAccountNumberFromCallerIdentity", async () => {
    const session = {
      type: SessionType.awsIamRoleFederated,
      roleArn: "abcdefghijklmnopqrstuvwxyz/12345",
    } as any;
    const awsIamRoleFederatedService = new AwsIamRoleFederatedService(null, null, null, null, null, null);
    const accountNumber = await awsIamRoleFederatedService.getAccountNumberFromCallerIdentity(session);

    expect(accountNumber).toBe("nopqrstuvwxy");
  });

  test("getAccountNumberFromCallerIdentity - error", async () => {
    const session = {};
    const awsIamRoleFederatedService = new AwsIamRoleFederatedService(null, null, null, null, null, null);

    await expect(() => awsIamRoleFederatedService.getAccountNumberFromCallerIdentity(session as AwsIamRoleFederatedSession)).rejects.toThrow(
      new Error("AWS IAM Role Federated Session required")
    );
  });

  test("sessionTokenFromGetSessionTokenResponse", () => {
    const fakeAssumeRoleResponse = {
      ["Credentials"]: {
        ["AccessKeyId"]: "fake-access-key-id",
        ["SecretAccessKey"]: "fake-secret-access-key",
        ["SessionToken"]: "fake-session-token",
      },
    } as any;
    const result = AwsIamRoleFederatedService.sessionTokenFromGetSessionTokenResponse(fakeAssumeRoleResponse);
    expect(result).toStrictEqual({
      sessionToken: {
        ["aws_access_key_id"]: "fake-access-key-id",
        ["aws_secret_access_key"]: "fake-secret-access-key",
        ["aws_session_token"]: "fake-session-token",
      },
    });
  });

  test("create", async () => {
    jest.spyOn(uuid, "v4").mockImplementation(() => "mocked-uuid");
    const repository = {
      addSession: jest.fn(),
      getSessions: jest.fn(() => "fake-sessions"),
    } as any;
    const sessionNotifier = {
      setSessions: jest.fn(),
    } as any;
    const request: AwsIamRoleFederatedSessionRequest = {
      idpArn: "fake-idp-arn",
      idpUrl: "fake-idp-url",
      profileId: "fake-profile-id",
      region: "fake-region",
      roleArn: "fake-region",
      sessionName: "fake-session-name",
    };
    const awsIamRoleFederatedService = new AwsIamRoleFederatedService(sessionNotifier, repository, null, null, null, null);
    awsIamRoleFederatedService.create(request);
    expect(repository.addSession).toHaveBeenCalledWith({
      sessionName: request.sessionName,
      region: request.region,
      idpUrlId: request.idpUrl,
      idpArn: request.idpArn,
      roleArn: request.roleArn,
      profileId: request.profileId,
      sessionId: "mocked-uuid",
      sessionTokenExpiration: undefined,
      startDateTime: undefined,
      status: 0,
      type: SessionType.awsIamRoleFederated,
    });
    expect(repository.getSessions).toHaveBeenCalled();
    expect(sessionNotifier.setSessions).toHaveBeenCalledWith("fake-sessions");
  });
});
