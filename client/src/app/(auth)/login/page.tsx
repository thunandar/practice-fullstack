"use client";

import { AdminLogin } from "@/src/lib/admin";
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  InputGroup,
  InputRightElement,
} from "@chakra-ui/react";
import { Input } from "@chakra-ui/react";
import { setCookie } from "cookies-next";
import { usePathname, useRouter } from "next/navigation";
import React, { useState } from "react";
import { useToast } from "@chakra-ui/react";
import { Text } from "@chakra-ui/react";
import { AiFillEyeInvisible, AiFillEye } from "react-icons/ai";
import Image from "next/image";
import Link from "next/link";

interface FormState {
  email: string;
  password: string;
}

interface ShowHideType {
  show: boolean;
  setShow: (value: any) => void;
}

const Login = () => {
  const pathname = usePathname();
  const router = useRouter();
  const [form, setform] = useState<FormState>({
    email: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [show, setShow] = useState(false);
  // const [errorText , setErrorText] = useState('')
  const toast = useToast();

  const formFillingFun = (type: string, value: string) => {
    setform({ ...form, [type]: value });
  };

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

  //Email && PW Validation

  const isValidEmail = (email: string) => {
    return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email);
  };

  const validEmail = isValidEmail(form.email);
  const validPassword = form.password.length >= 6;
  const validSituation = validEmail && validPassword;

  const LoginFunc = async () => {
    setIsLoading(true);
    if (!validSituation) {
      toastFun(
        "Error",
        "Wrong Email Pattern , Password must greater than 6 characters ",
        "error"
      );
      setIsLoading(false);
      return null;
    }
    const res = await AdminLogin(form);
    if (res === undefined) {
      setIsLoading(false);
      return;
    }
    if (res.status === 1) {
      toastFun("Error", res.message, "error");
      setIsLoading(false);
    } else if (res.status === 0) {
      toastFun("Success", res.message, "success");
      const cookieName = "access_token";
      const cookieValue = res.access_token;
      const maxAge = 24 * 60 * 60; // 1 day
      setCookie(cookieName, cookieValue, { maxAge });
      router.push("/dashboard");
    }
    setIsLoading(false);
  };

  return (
    <Box
      w={"100vw"}
      h={"100vh"}
      display={"flex"}
      bgSize={"cover"}
      alignItems={{ sm: "flex-start", md: "center" }}
      justifyContent={"center"}
      p={{ sm: 0, md: "4rem" }}
      className="loginBg"
    >
      <Box
        width={{ base: "100%", md: "70%", lg: "60%", xl: "50%", xxl: "35%" }}
        my={{ base: "4rem", md: 0 }}
        p={{ base: 6, sm: 2, md: 0 }}
      >
        <Box
          display={"flex"}
          mt={5}
          justifyContent={"center"}
          alignItems={{ base: "flex-start", md: "center" }}
        >
          <Box
            w={"100%"}
            px={{ base: "1.75rem", md: "2.3rem" }}
            pb={{ base: "1.75rem", md: "2.3rem" }}
            pt={{ base: "1.75rem", md: "2rem" }}
            bgColor={"white"}
            className="loginShadow"
            borderRadius={7}
          >
            <Link href={"/"}>
              <Box display={"flex"} justifyContent={"center"} mb={4}>
                <Image
                  src="/images/selogoicon_primary.png"
                  alt="Sport_Empire_Logo"
                  width={80}
                  height={60}
                />
              </Box>
            </Link>
            <Text
              fontSize={{ base: "lg", sm: "22px", md: "25px" }}
              textAlign={"center"}
              fontWeight={"bold"}
              userSelect={"none"}
              mb={5}
            >
              Login to Admin Panel
            </Text>

            <FormControl mb={3}>
              <FormLabel
                color={"gray"}
                userSelect={"none"}
                htmlFor="field-R2ladlllaiucq-label"
                id="field-R2ladlllaiucq-label"
              >
                Email address
              </FormLabel>
              <Input
                placeholder="Email"
                size="md"
                color={"black"}
                mb={"0.8rem"}
                _placeholder={{ color: "white" }}
                onChange={(e) => formFillingFun("email", e.target.value)}
                id="field-R2ladlllaiucq"
              />
            </FormControl>
            <FormControl mb={3}>
              <FormLabel
                color={"gray"}
                userSelect={"none"}
                htmlFor="field-R2ladlllaiucq-label"
                id="field-R2ladlllaiucq-label"
              >
                Password
              </FormLabel>
              <InputGroup>
                <InputRightElement
                  className="InputLeft"
                  children={<PwShowHideFun show={show} setShow={setShow} />}
                />
                <Input
                  type={show ? "text" : "password"}
                  placeholder="Password"
                  size="md"
                  color={"black"}
                  mb={"0.8rem"}
                  _placeholder={{ color: "white" }}
                  onChange={(e) => formFillingFun("password", e.target.value)}
                  id="field-R2ladlllaiucq"
                />
              </InputGroup>
            </FormControl>
            <Box display={"flex"} justifyContent={"center"} mt={5}>
              <Button
                isLoading={isLoading}
                loadingText="Loading"
                width={"100%"}
                variant="solid"
                size="md"
                fontSize={"sm"}
                spinnerPlacement="start"
                bgColor={"#5A66F1"}
                color={"white"}
                _hover={{
                  bgColor: "#30388c",
                }}
                transitionDuration={"500ms"}
                onClick={LoginFunc}
              >
                LOGIN
              </Button>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default Login;

function PwShowHideFun({ show, setShow }: ShowHideType) {
  return (
    <>
      {show ? (
        <AiFillEye onClick={() => setShow(false)} className=" cursor-pointer" />
      ) : (
        <AiFillEyeInvisible
          onClick={() => setShow(true)}
          className=" cursor-pointer"
        />
      )}
    </>
  );
}
