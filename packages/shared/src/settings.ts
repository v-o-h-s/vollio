export interface Tag {
  id: string;
  label: string;
  color: string;
  isDefault: boolean;
}

export interface UserSettings {
  tags: Tag[];
}
