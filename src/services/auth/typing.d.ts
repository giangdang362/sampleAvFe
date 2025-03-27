declare namespace API {
  type SignUpParams = {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
  };

  type LogoutPayload = {
    token: string;
  };
  type LogoutResponse = {
    logout: boolean;
  };

  // Query string XXXXQuery
  // Post body XXXPayload
  //
  type RefreshTokenParams = {
    refreshToken?: string | null;
  };

  type SignInWithOAuthParams = {
    provider: "google" | "discord";
  };

  type SignInWithPasswordPayload = {
    email: string;
    password: string;
    isRememberMe: boolean;
  };

  type SignInWithPasswordResponse = {
    accessToken?: string;
    refreshToken?: string;
    expiresIn?: number;
    expiresAt?: number;
    user?: UserItem;
  };

  type ResetPasswordParams = {
    email: string;
  };
  type Role = {
    createdAt: string;
    updatedAt: string;
    deletedAt?: string;
    id: number;
    slug: string;
    name: string;
    permissions: string[];
    isCanEdit: boolean;
    isActive: boolean;
    roleId?: string;
    parent?: string;
  };
  type ForgotPasswordResquest = {
    email: string;
  };
  type CreateNewPasswordRequest = {
    token: string;
    email: string;
    newPassword: string;
  };

  type CreateAccountRequest = {
    email: string;
    password: string;
    firstName: string;
    social: {
      facebook?: string;
      twitter?: string;
      linkedin: string;
      instagram?: string;
    };
    data: {
      primarilyWork: {
        list: string[];
        other?: string | null;
      };
    };
    organization: {
      name: string;
      website: string;
      phone: string;
      address: {
        addressLine1: string;
        countryId: number;
      };
      data: {
        expertise: {
          list: string[];
          other?: string | null;
        };
        clientTypes: {
          list: string[];
          other?: string | null;
        };
      };
    };
  };
}
