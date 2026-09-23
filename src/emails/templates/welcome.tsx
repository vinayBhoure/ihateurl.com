import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Text,
} from "@react-email/components";

export interface WelcomeEmailProps {
  name: string;
}

/**
 * Sent once after a user finishes signup.
 *
 * Clerk does not send anything like this on its own — its emails are
 * limited to auth mechanics (verification codes, magic links, password
 * resets). This is where app-level "welcome" messaging belongs.
 */
export default function WelcomeEmail({ name }: WelcomeEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Welcome aboard, {name}!</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={heading}>Welcome, {name}!</Heading>
          <Text style={text}>
            Thanks for signing up. Your account is ready to go — jump back
            in whenever you&apos;re ready.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

const main = {
  backgroundColor: "#f6f6f6",
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
};

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "32px",
  borderRadius: "8px",
  maxWidth: "480px",
};

const heading = {
  fontSize: "20px",
  fontWeight: 600,
  color: "#111111",
};

const text = {
  fontSize: "14px",
  lineHeight: "22px",
  color: "#333333",
};
