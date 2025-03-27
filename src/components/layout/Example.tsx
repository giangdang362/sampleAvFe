"use client";
// Example
import { useAppSelector } from "@/store";
import {
  selectIsHiddenSearch,
  toggleHiddenSearch,
} from "@/store/features/globalSlice";
import { useDispatch } from "react-redux";

export default function HiddenSearch() {
  const dispath = useDispatch();
  const isHiddenSearch = useAppSelector(selectIsHiddenSearch);

  const handleHidden = () => {
    dispath(
      toggleHiddenSearch({
        isHiddenSearch: !isHiddenSearch,
      }),
    );
  };

  // Copy To hidden search

  // const dispath = useDispatch();
  // dispath(toggleHiddenSearch({
  //   isHiddenSearch: true,
  // }));

  // useEffect(() => {
  //   const timmer = setTimeout(() => {
  //     dispath(toggleHiddenSearch({
  //       isHiddenSearch: true,
  //     }));
  //   }, 10000);
  //   return () => {
  //     clearTimeout(timmer);
  //   }
  // }, []);
  return (
    <button
      onClick={() => {
        handleHidden();
      }}
    >
      Hidden
    </button>
  );
}
