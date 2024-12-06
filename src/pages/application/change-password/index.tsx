import React, { useState } from "react";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Form } from "@/components/ui/form";
import { CreatePasswordService } from "@/services/create-password.service"; 
import { z } from "zod"; 


const formSchema = z
  .object({
    password: z
      .string()
      .min(8, "Password must be at least 8 characters.")
      .regex(/[A-Z]/, "Password must include at least one uppercase letter.")
      .regex(/[a-z]/, "Password must include at least one lowercase letter.")
      .regex(/[0-9]/, "Password must include at least one number."),
    confirmPassword: z.string().min(8, "Please confirm your password."),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

interface IndexChangePasswordProps {
  isDrawerOpen: boolean;
  toggleDrawer: () => void;
}

const IndexChangePassword: React.FC<IndexChangePasswordProps> = ({ isDrawerOpen, toggleDrawer }) => {
  const [oldPassword, setOldPassword] = useState<string>("");
  const [newPassword, setNewPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  const createPasswordService = new CreatePasswordService();

  const handlePasswordChange = () => {
    try {
      formSchema.parse({ password: newPassword, confirmPassword });
    } catch (err) {
      if (err instanceof z.ZodError) {
        setError(err.errors[0].message);
        return;
      }
    }

    if (!oldPassword || !newPassword || !confirmPassword) {
      setError("All fields are required.");
      return;
    }

    const existingPassword = createPasswordService.getPassword();
    if (existingPassword !== oldPassword) {
      setError("Old password is incorrect.");
      return;
    }

    try {
      createPasswordService.updatePassword(newPassword);
      setError(null);
      toggleDrawer();
    } catch (e) {
      setError("An error occurred while updating the password.");
    }
  };

  return (
    <Drawer open={isDrawerOpen} onOpenChange={toggleDrawer}>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>CHANGE PASSWORD</DrawerTitle>
        </DrawerHeader>
        <DrawerDescription>
          <div className="p-6">
            <Form>
              <div className="mb-4">
                <Label className="font-bold">Enter old password:</Label>
                <Input
                  type="password"
                  placeholder="********"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                />
              </div>
              <div className="mb-4">
                <Label className="font-bold">Enter new password:</Label>
                <Input
                  type="password"
                  placeholder="********"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>
              <div className="mb-4">
                <Label className="font-bold">Confirm new password:</Label>
                <Input
                  type="password"
                  placeholder="********"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
              {error && <div className="text-red-500 mb-4">{error}</div>}
              <div className="mt-6">
                <Button type="button" variant="violet" onClick={handlePasswordChange}>
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
