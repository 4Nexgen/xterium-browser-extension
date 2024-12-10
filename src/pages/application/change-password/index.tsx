import React, { useState } from "react";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Form } from "@/components/ui/form";
import { CreatePasswordService } from "@/services/create-password.service"; 
import { z } from "zod"; 
import { Eye, EyeOff } from "lucide-react";

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

  const [showOldPassword, setShowOldPassword] = useState<boolean>(false);
  const [showNewPassword, setShowNewPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);

  const toggleOldPasswordVisibility = () => {
    setShowOldPassword(!showOldPassword);
  };
  const toggleNewPasswordVisibility = () => {
    setShowNewPassword(!showNewPassword);
  };
  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const createPasswordService = new CreatePasswordService();

  // Async function to handle password change
  const handlePasswordChange = async () => {
    try {
      // Validate the form fields using Zod schema
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

    try {
      // Check if the old password matches the stored password
      const existingPassword = await createPasswordService.getPassword();  // async call to get password
      if (existingPassword !== oldPassword) {
        setError("Old password is incorrect.");
        return;
      }

      // If passwords match, update the password
      await createPasswordService.updatePassword(newPassword); // async call to update password
      setError(null);  // Clear any previous error
      toggleDrawer();  // Close the drawer upon success
    } catch (e) {
      if (e instanceof Error) {
        setError(e.message); // Handle any errors from the service
      } else {
        setError("An error occurred while updating the password.");
      }
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
                <div className="relative">
                  <Input
                    type={showOldPassword ? "text" : "password"} // Toggle input type based on visibility
                    placeholder="********"
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={toggleOldPasswordVisibility}
                    className="absolute inset-y-0 right-3 flex items-center text-[#9AB3EB] hover:text-[#9AB3EB]"
                  >
                    {showOldPassword ? <Eye size={20} /> : <EyeOff size={20} />}
                  </button>
                </div>
              </div>
              <div className="mb-4">
                <Label className="font-bold">Enter new password:</Label>
                <div className="relative">
                  <Input
                    type={showNewPassword ? "text" : "password"} // Toggle input type based on visibility
                    placeholder="********"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={toggleNewPasswordVisibility}
                    className="absolute inset-y-0 right-3 flex items-center text-[#9AB3EB] hover:text-[#9AB3EB]"
                  >
                    {showNewPassword ? <Eye size={20} /> : <EyeOff size={20} />}
                  </button>
                </div>
              </div>
              <div className="mb-4">
                <Label className="font-bold">Confirm new password:</Label>
                <div className="relative">
                  <Input
                    type={showConfirmPassword ? "text" : "password"} // Toggle input type based on visibility
                    placeholder="********"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={toggleConfirmPasswordVisibility}
                    className="absolute inset-y-0 right-3 flex items-center text-[#9AB3EB] hover:text-[#9AB3EB]"
                  >
                    {showConfirmPassword ? <Eye size={20} /> : <EyeOff size={20} />}
                  </button>
                </div>
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
