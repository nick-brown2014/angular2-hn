export default function ErrorMessage({ message }: { message: string }) {
  return <div className="error-section">{message}</div>;
}
