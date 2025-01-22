export interface SidebarProps {
    title: string;
    items: string[];
    onSelect: (item: string) => void;
}
