import { useParams } from 'react-router-dom';

export function ItemDetails() {
    const { id } = useParams();
    return <section data-testid="item-placeholder"><h2>Item {id} — details coming in Step 5</h2></section>;
}
