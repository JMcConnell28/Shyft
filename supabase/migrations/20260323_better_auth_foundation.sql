create table if not exists public."user" (
  "id" text not null primary key,
  "name" text not null,
  "email" text not null unique,
  "emailVerified" boolean not null,
  "image" text,
  "createdAt" timestamptz default current_timestamp not null,
  "updatedAt" timestamptz default current_timestamp not null
);

create table if not exists public."organization" (
  "id" text not null primary key,
  "name" text not null,
  "slug" text not null unique,
  "logo" text,
  "createdAt" timestamptz not null,
  "metadata" text
);

create table if not exists public."session" (
  "id" text not null primary key,
  "expiresAt" timestamptz not null,
  "token" text not null unique,
  "createdAt" timestamptz default current_timestamp not null,
  "updatedAt" timestamptz not null,
  "ipAddress" text,
  "userAgent" text,
  "userId" text not null references public."user" ("id") on delete cascade,
  "activeOrganizationId" text
);

create table if not exists public."account" (
  "id" text not null primary key,
  "accountId" text not null,
  "providerId" text not null,
  "userId" text not null references public."user" ("id") on delete cascade,
  "accessToken" text,
  "refreshToken" text,
  "idToken" text,
  "accessTokenExpiresAt" timestamptz,
  "refreshTokenExpiresAt" timestamptz,
  "scope" text,
  "password" text,
  "createdAt" timestamptz default current_timestamp not null,
  "updatedAt" timestamptz not null
);

create table if not exists public."verification" (
  "id" text not null primary key,
  "identifier" text not null,
  "value" text not null,
  "expiresAt" timestamptz not null,
  "createdAt" timestamptz default current_timestamp not null,
  "updatedAt" timestamptz default current_timestamp not null
);

create table if not exists public."member" (
  "id" text not null primary key,
  "organizationId" text not null references public."organization" ("id") on delete cascade,
  "userId" text not null references public."user" ("id") on delete cascade,
  "role" text not null,
  "createdAt" timestamptz not null
);

create table if not exists public."invitation" (
  "id" text not null primary key,
  "organizationId" text not null references public."organization" ("id") on delete cascade,
  "email" text not null,
  "role" text,
  "status" text not null,
  "expiresAt" timestamptz not null,
  "createdAt" timestamptz default current_timestamp not null,
  "inviterId" text not null references public."user" ("id") on delete cascade
);

create table if not exists public."passkey" (
  "id" text not null primary key,
  "name" text,
  "publicKey" text not null,
  "userId" text not null references public."user" ("id") on delete cascade,
  "credentialID" text not null,
  "counter" integer not null,
  "deviceType" text not null,
  "backedUp" boolean not null,
  "transports" text,
  "createdAt" timestamptz,
  "aaguid" text
);

create index if not exists "session_userId_idx" on public."session" ("userId");
create index if not exists "account_userId_idx" on public."account" ("userId");
create index if not exists "verification_identifier_idx" on public."verification" ("identifier");
create unique index if not exists "organization_slug_uidx" on public."organization" ("slug");
create index if not exists "member_organizationId_idx" on public."member" ("organizationId");
create index if not exists "member_userId_idx" on public."member" ("userId");
create index if not exists "invitation_organizationId_idx" on public."invitation" ("organizationId");
create index if not exists "invitation_email_idx" on public."invitation" ("email");
create index if not exists "passkey_userId_idx" on public."passkey" ("userId");
create index if not exists "passkey_credentialID_idx" on public."passkey" ("credentialID");
