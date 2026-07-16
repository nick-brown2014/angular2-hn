import { useParams } from 'react-router-dom';

export function UserPage() {
    const { id } = useParams();
    return <section data-testid="user-placeholder"><h2>User {id} — profile coming in Step 6</h2></section>;
}
