import React from "react";
import type { NextPage } from "next";
import {
  Button,
  Center,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import { ClerkLoaded, useClerk, UserButton, useSignIn, useUser } from "@clerk/nextjs";

const Home: NextPage = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isSignedIn } = useUser();

  React.useEffect(() => {
    return () => console.log(">> unmount");
  }, []);

  return (
    <Center h="100vh" w="100%" flexDirection={"column"}>
      <Button colorScheme="blue" onClick={onOpen}>
        Open sign in modal
      </Button>
      {isSignedIn && (
        <Center m={10}>
          <Heading as="h4" mr={4}>
            User:
          </Heading>
          <UserButton afterSignOutAllUrl="/" />
        </Center>
      )}
      <ClerkLoaded>
        <SignInModal isOpen={isOpen} onClose={onClose} />
      </ClerkLoaded>
    </Center>
  );
};

function SignInModal({ isOpen, onClose }: any) {
  const { setSession } = useClerk();
  const signIn = useSignIn();
  const { isSignedIn, user } = useUser();
  const toast = useToast();
  const [isLoading, setIsLoading] = React.useState(false);
  const [formState, setFormState] = React.useState({
    identifier: "",
    password: "",
  });

  const showSuccessToast = () =>
    toast({ title: "Success!", description: "You just signed in.", status: "success", position: "top-right" });

  const showErrorToast = (description: string) =>
    toast({ title: "Error", description, status: "error", position: "top-right" });

  const changeFormValue: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const { value, name } = e.target;
    setFormState((s) => ({ ...s, [name]: value }));
  };

  const startSignInFlow = async () => {
    setIsLoading(true);
    const { identifier, password } = formState;
    try {
      await signIn.create({ identifier });
      const { createdSessionId } = await signIn.attemptFirstFactor({ strategy: "password", password });
      await setSession(createdSessionId);
      showSuccessToast();
    } catch (e: any) {
      showErrorToast(e.errors[0].message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      {isSignedIn && (
        <ModalContent>
          <ModalHeader>User info</ModalHeader>
          <ModalBody pb={6}>
            First name: {user.firstName} <br />
            First name: {user.lastName} <br />
            Email address: {user.primaryEmailAddress?.emailAddress}
          </ModalBody>
        </ModalContent>
      )}
      {!isSignedIn && (
        <ModalContent>
          <ModalHeader>Sign In</ModalHeader>
          <ModalBody pb={6}>
            <FormControl isDisabled={isLoading}>
              <FormLabel>Email address</FormLabel>
              <Input
                placeholder="email address"
                value={formState.identifier}
                name="identifier"
                onChange={changeFormValue}
              />
            </FormControl>
            <FormControl mt={4} isDisabled={isLoading}>
              <FormLabel>Password</FormLabel>
              <Input
                placeholder="password"
                type="password"
                value={formState.password}
                name="password"
                onChange={changeFormValue}
              />
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={startSignInFlow} isLoading={isLoading} disabled={isLoading}>
              Sign in
            </Button>
            <Button onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
          </ModalFooter>
        </ModalContent>
      )}
    </Modal>
  );
}

export default Home;
