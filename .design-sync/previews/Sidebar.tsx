import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider
} from 'restosync-web';

export const AppShell = () => (
  <SidebarProvider className='h-96 min-h-0 overflow-hidden rounded-lg border'>
    <Sidebar collapsible='none'>
      <SidebarHeader className='px-3 py-2 font-semibold'>RestoSync</SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Manage</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton isActive>Menu</SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton>Orders</SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton>Reports</SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className='px-3 py-2 text-sm'>Dev User</SidebarFooter>
    </Sidebar>
    <SidebarInset>
      <div className='text-muted-foreground p-4 text-sm'>Main content area</div>
    </SidebarInset>
  </SidebarProvider>
);
