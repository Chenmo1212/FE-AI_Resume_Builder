import { useItems } from '../../stores/settings.store';

export function PhotoElement({ children }) {
  const isPhotoDisplayed = useItems((state) => state.isPhotoDisplayed);

  return isPhotoDisplayed && children;
}
