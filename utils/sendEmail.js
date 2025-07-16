import {resend } from "../lib/resend.js";
import { loadTemplate } from "./loadTemplate.js";


//Send email for welcome 
export const sendWelcomeEmail = async (email, url) => {
  try {
   const html = loadTemplate("welcomeEmail", { url });
   const response = await resend.emails.send({
      from: "YoutubeClone <onboarding@resend.dev>", // Todo: change email
      to: email,
      subject: "🎉 Welcome to Youtube Clone!",
      html,
    });
      
       console.log('Welcome email sent successfully:', response);
      return { success: true };

  } catch (err) {
   console.error('Failed to send OTP email:', err);
    return { success: false, err };
  }
};

// send eamil for otp
export const sendOtpEmail = async (email, otp) => {
  try {
    const html = loadTemplate("otpEmail", { otp })
    const response = await resend.emails.send({
      from: "YoutubeClone <onboarding@resend.dev>",
      to: email,
      subject: "🔐 OTP Code",
      html,
    });
       console.log('OTP email sent successfully:', response);
      return { success: true };
      
  } catch (error) {
    console.error('Failed to send OTP email:', error);
    return { success: false, error };
  }
};
