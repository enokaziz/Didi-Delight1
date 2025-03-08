export interface PasswordInputProps {
  value: string;
  onChange: (text: string) => void;
  showPassword: boolean;
  toggleShowPassword: () => void;
  error?: string;
}
