import React from "react";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Form } from "@/components/ui/form";

interface IndexChangePasswordProps {
  isDrawerOpen: boolean;
  toggleDrawer: () => void;
}

const IndexChangePassword: React.FC<IndexChangePasswordProps> = ({ isDrawerOpen, toggleDrawer }) => {
  return (
    <Drawer open={isDrawerOpen} onOpenChange={toggleDrawer}>
      <DrawerContent>
        <DrawerHeader className="border-b border[#2B3856]">
          <DrawerTitle className="font-inter font-extrabold text-[12px] leading-[15px] tracking-[0.15em] text-[#9AB3EB]">
            Change Password
          </DrawerTitle>
        </DrawerHeader>
        <DrawerDescription>
          <div className="p-6">
            <Form>
              <div className="mb-4">
                <Label className="font-bold">
                  Enter old password:
                </Label>
                <Input
                  type="password"
                  placeholder="********"
                />
              </div>
              <div className="mb-4">
                <Label className="font-bold">
                  Enter new password:
                </Label>
                <Input
                  type="password"
                  placeholder="********"
                />
              </div>
              <div className="mb-4">
                <Label className="font-bold">
                  Confirm new password:
                </Label>
                <Input
                  type="password"
                  placeholder="********"
                />
              </div>
              <div className="mt-6">
                <Button type="button" variant="violet">
                  CONFIRM
                </Button>
              </div>
            </Form>
          </div>
        </DrawerDescription>
      </DrawerContent>
    </Drawer>
  );
};

export default IndexChangePassword;
