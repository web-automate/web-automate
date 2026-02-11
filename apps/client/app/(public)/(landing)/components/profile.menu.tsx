import { notify } from "@/app/components/notifications";
import { authClient } from "@/lib/auth.client";
import { Avatar, Menu } from "@mantine/core";
import { IconHome, IconLogout, IconSettings, IconWorld } from "@tabler/icons-react";
import { User } from "better-auth";
import { useState } from "react";

const ProfileMenu = ({ user }: { user: User }) => {
    const [isSignoutingOut, setIsSignoutingOut] = useState(false);

    const handleSignOut = async () => {
        setIsSignoutingOut(true);
        await authClient.signOut({
            fetchOptions: {
                onSuccess: () => notify.success("Signed out successfully"),
                onError: () => notify.error("Failed to sign out, please try again or contact support"),
            }
        });
        window.location.reload();
        setIsSignoutingOut(false);
    };
    return (
        <Menu shadow="md" position="bottom-end" width={200}>
            <Menu.Target>
                <Avatar src={user.image} style={{ cursor: 'pointer' }} />
            </Menu.Target>

            <Menu.Dropdown>
                <Menu.Label>Application</Menu.Label>
                <Menu.Item leftSection={<IconHome size={14} />}>
                    Dashboard
                </Menu.Item>
                <Menu.Item leftSection={<IconWorld size={14} />}>
                    Websites
                </Menu.Item>
                <Menu.Item leftSection={<IconSettings size={14} />}>
                    Settings
                </Menu.Item>

                <Menu.Divider />

                <Menu.Label>Danger zone</Menu.Label>
                <Menu.Item
                    color="red"
                    leftSection={<IconLogout size={14} />}
                    onClick={handleSignOut}
                    disabled={isSignoutingOut}
                >
                    Logout
                </Menu.Item>
            </Menu.Dropdown>
        </Menu>
    )
}

export default ProfileMenu;