export interface ActivityTag {
  id: number;
  name: string;
  promptText: string;
}

export interface ActivityTagView extends ActivityTag {
  fontIcon: string;
}
