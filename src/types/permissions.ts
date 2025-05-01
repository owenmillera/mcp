export type ActionPermission = {
    access: "none" | "partial" | "full";
    fields?: string[];
    presets?: Record<string, any>;
};

export type CollectionPermissions = {
    create: ActionPermission;
    read: ActionPermission;
    update: ActionPermission;
    delete: ActionPermission;
    share: ActionPermission;
};

export type UserPermissionsData = Record<string, CollectionPermissions>;
