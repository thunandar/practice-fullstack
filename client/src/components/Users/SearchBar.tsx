"use client";

import { SearchIcon } from "@chakra-ui/icons";
import {
  Button,
  Input,
  InputGroup,
  InputRightElement,
  useToast,
} from "@chakra-ui/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

function SearchBar() {
  const [value, setValue] = useState("");
  const router = useRouter();
  const toast = useToast();

  const toastFun = (
    condition: string,
    description: string,
    statusInd: "error" | "success"
  ) => {
    toast({
      position: "top-right",
      title: condition,
      description: description,
      status: statusInd,
      duration: 3000,
      isClosable: true,
    });
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateSearchParams(value);
    setValue("");
  };

  const updateSearchParams = (value: string) => {
    const searchParams = new URLSearchParams(window.location.search);

    if (value) {
      searchParams.set("search", value);
    } else {
      searchParams.delete("search");
    }

    const newPathname = `${
      window.location.pathname
    }?${searchParams.toString()}`;

    router.push(newPathname);
  };

  return (
    <form onSubmit={handleSearch}>
      <InputGroup size="md" width="fit-content">
        <Input
          placeholder="Search"
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
        <InputRightElement>
          <Button type="submit">
            <SearchIcon />
          </Button>
        </InputRightElement>
      </InputGroup>
    </form>
  );
}

export default SearchBar;
