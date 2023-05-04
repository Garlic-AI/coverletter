import { AnimatePresence, motion } from "framer-motion";
import React from "react";
import type { NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import { useState, useEffect, useId } from "react";
import { Toaster, toast } from "react-hot-toast";
import DropDown, { VibeType } from "../components/DropDown";
import Footer from "../components/Footer";
import Github from "../components/GitHub";
import Header from "../components/Header";
import LoadingDots from "../components/LoadingDots";
import ResizablePanel from "../components/ResizablePanel";
import BackgroundCircles from "../components/BackgroundCircles";
import { randomSiteData } from "../lib/randomSiteData";
import { RiNumber1 } from "react-icons/ri";
import Link from "next/link";
import Faq from "../components/Faq";
import { FcSearch } from "react-icons/fc";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import "github-markdown-css/github-markdown.css";

const Home: NextPage = () => {
  const [loading, setLoading] = useState(false);
  const [randomizing, setRandomizing] = useState(false);
  const [url, setUrl] = useState("");
  const [generatedFeedback, setGeneratedFeedback] = useState<String>("");

  const generateFeedback = async (recentURL: string = url) => {
    setGeneratedFeedback("");
    setLoading(true);

    const isValidURL = (str: string) => {
      try {
        new URL(str);
        //make sure that the url is only one word
        if (str.split(" ").length > 1) {
          return false;
        }

        return true;
      } catch (error) {
        return false;
      }
    };

    let fullUrl = recentURL.trim();
    if (!/^https?:\/\//i.test(fullUrl)) {
      fullUrl = "https://" + fullUrl;
    }
    //remove trailing slash if it exists
    if (fullUrl[fullUrl.length - 1] === "/") {
      fullUrl = fullUrl.slice(0, -1);
    }

    console.log(fullUrl);

    if (!isValidURL(fullUrl)) {
      console.error("Invalid URL provided.");
      toast.error("Invalid URL provided", {
        icon: "❌",
      });
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/fetchWebsiteContent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url: fullUrl,
        }),
      });

      console.log("encoded url", encodeURIComponent(fullUrl));

      console.log("fetched and trimmed", response.body);

      if (!response.ok) {
        const statusText = response.statusText
          ? response.statusText
          : "This site isn't valid. Maybe try another?";
        toast.error(statusText, {
          icon: "❌",
        });
        setLoading(false);
        return;
      }

      const siteContent = await response.text();

      const feedbackResponse = await fetch("/api/generateSummaryFromText", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: siteContent,
        }),
      });
      console.log("Edge function returned.");
      console.log("Response is", feedbackResponse);

      if (!response.ok) {
        const statusText = feedbackResponse.statusText
          ? feedbackResponse.statusText
          : "This site isn't valid. Maybe try another?";
        toast.error(statusText, {
          icon: "❌",
        });
        setLoading(false);

        // throw new Error(response.statusText);
      }

      // This data is a ReadableStream
      const data = feedbackResponse.body;
      console.log("Data readable stream", data);
      if (!data) {
        setLoading(false);
        return;
      }

      const reader = data.getReader();
      const decoder = new TextDecoder();
      let done = false;

      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        const chunkValue = decoder.decode(value);
        setGeneratedFeedback((prev) => {
          const newGeneratedFeedback = prev + chunkValue;
          console.log("feedback is ", newGeneratedFeedback);
          return newGeneratedFeedback;
        });
      }

      setLoading(false);
    } catch (error) {
      const statusText =
        "An unexpected error occured. Try again or try another site";
      toast.error(statusText, {
        icon: "❌",
      });
      setLoading(false);
    }
  };

  return (
    <div className="dark:bg-[#111a31] bg-gray-50">
      <div className="">
        <div className="w-full md:text-lg text-xs bg-[#7721c1] text-center hover:cursor-pointer font-semibold text-white h-12 items-center z-10 flex justify-center">
          <div>
            {/* Built by @michael_chomsky & Sponsored By{" "} */}
            Built by{" "}
            <a
              href="https://twitter.com/michael_chomsky"
              target="_blank"
              className="text-white hover:cursor-pointer underline md:text-xl text-md w-full"
            >
              michael_chomsky
            </a>{" "}
            & Sponsored By ...
            <a
              href="mailto: contact@siteexplainer.com"
              className="text-white hover:cursor-pointer underline md:text-xl text-md w-full"
            >
              you
            </a>
            ? 👉👈
          </div>
        </div>
      </div>
      <div>
        <Toaster />
      </div>
      <div className="flex max-w-5xl mx-auto flex-col items-center justify-center min-h-screen flex max-w-5xl mx-auto flex-col items-center justify-center py-2 min-h-screen">
        <Head>
          <title>SiteExplainer</title>
          <link rel="icon" href="/favicon.ico" />
        </Head>

        <Header />
        <div className={"z-0"}>
          <BackgroundCircles />
        </div>
        <main className="flex z-10 flex-1 w-full flex-col items-center justify-center text-center px-4 mt-12 sm:mt-20">
          <h1 className="mx-auto mt-10 md:mt-24 z-2 max-w-4xl font-bold text-3xl tracking-tight text-slate-900 sm:text-6xl dark:text-white">
            Simplify Complex Websites with{" "}
            <span className="relative whitespace-nowrap text-blue-600">
              <svg
                aria-hidden="true"
                viewBox="0 0 418 42"
                className="absolute top-2/3 left-0 h-[0.58em] w-full fill-blue-300/70"
                preserveAspectRatio="none"
              >
                <path d="M203.371.916c-26.013-2.078-76.686 1.963-124.73 9.946L67.3 12.749C35.421 18.062 18.2 21.766 6.004 25.934 1.244 27.561.828 27.778.874 28.61c.07 1.214.828 1.121 9.595-1.176 9.072-2.377 17.15-3.92 39.246-7.496C123.565 7.986 157.869 4.492 195.942 5.046c7.461.108 19.25 1.696 19.17 2.582-.107 1.183-7.874 4.31-25.75 10.366-21.992 7.45-35.43 12.534-36.701 13.884-2.173 2.308-.202 4.407 4.generateS442 4.734 2.654.187 3.263.157 15.593-.78 35.401-2.686 57.944-3.488 88.365-3.143 46.327.526 75.721 2.23 130.788 7.584 19.787 1.924 20.814 1.98 24.557 1.332l.066-.011c1.201-.203 1.53-1.825.399-2.335-2.911-1.31-4.893-1.604-22.048-3.261-57.509-5.556-87.871-7.36-132.059-7.842-23.239-.254-33.617-.116-50.627.674-11.629.54-42.371 2.494-46.696 2.967-2.359.259 8.133-3.625 26.504-9.81 23.239-7.825 27.934-10.149 28.304-14.005.417-4.348-3.529-6-16.878-7.066Z" />
              </svg>
              <span className="relative">SiteExplainer</span>
            </span>{" "}
            Say Goodbye to Confusing Pages.
          </h1>
          <Link
            href="https://github.com/MichaelAPCS/siteexplainer"
            className="flex max-w-fit items-center justify-center space-x-2 rounded-full border border-gray-700 bg-white px-4 py-2 text-sm text-gray-600 shadow-md transition-colors hover:bg-gray-100  mt-6"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Github />
            <p>Star on GitHub</p>
          </Link>
          <p className="mx-auto mt-6 max-w-2xl text-lg tracking-tight text-slate-700 dark:text-gray-200">
            An effortless way to understand what a website is about, Our
            AI-powered web app allows you to quickly and accurately summarize
            any website in just a few seconds
          </p>
          {/* <p className="text-slate-700 mt-5 dark:text-gray-300">
              5196 site summaries generated so far.
            </p> */}
          <div className="max-w-xl w-full">
            <div className="flex mt-10 items-center space-x-3 ">
              <div
                className={
                  "dark:bg-gray-600 rounded-full p-1 mt-1 bg-gray-200 "
                }
              >
                <RiNumber1 className={""} />
              </div>
              <p className="text-left font-medium">
                confusing website url{" "}
                <span className="text-slate-500">
                  {/* (or any blog or article you want summarized!) */}
                </span>
                {/* . */}
              </p>
            </div>
            <div className="flex flex-row items-center px-4">
              <input
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full rounded-l-md border-gray-100  shadow-lg dark:bg-gray-200 bg-gray-100 focus:border-1 outline-none  dark:text-black my-5 p-3"
                placeholder={"thislandingpagemakesnosense.com"}
              />
              <FcSearch className="text-5xl dark:bg-gray-200 bg-gray-100 p-2 rounded-r-md text-black" />
            </div>
            <div className="flex md:flex-row flex-col gap-4  md:gap-8 justify-center mt-4 px-4">
              {!loading && (
                <button
                  className="bg-[#7721c1] md:w-1/3 w-full rounded-xl shadow-inner shadow-gray-400  duration-100 hover:bg-[#6813b2] hover:scale-105 py-3 text-lg font-semibold text-white text-center"
                  onClick={(e) => {
                    e.preventDefault();
                    generateFeedback();
                  }}
                >
                  <span>Explain &rarr;</span>
                </button>
              )}
              {loading && (
                <button
                  className="bg-[#7721c1] rounded-xl md:w-1/3 w-full shadow-inner shadow-gray-400  duration-100 hover:bg-[#6813b2] text-lg font-semibold py-3"
                  disabled
                >
                  <LoadingDots color="white" style="large" />
                </button>
              )}
            </div>
          </div>
          <Toaster
            position="top-center"
            reverseOrder={false}
            toastOptions={{ duration: 2000 }}
          />
          <hr className="h-px bg-gray-700 border-1 dark:bg-gray-700" />
          <ResizablePanel>
            <AnimatePresence mode="wait">
              <motion.div className="my-10">
                {generatedFeedback && (
                  <>
                    <div>
                      <h2 className="sm:text-4xl dark:text-white text-3xl font-bold text-slate-900 mx-auto mb-6">
                        Your generated feedback
                      </h2>
                    </div>
                    <div className="space-y-8 dark:text-white flex flex-col items-center justify-center max-w-xl mx-auto">
                      <div
                        style={{ maxWidth: "inherit" }}
                        className="rounded-xl dark:text-white p-4 bg-white transition cursor-copy border text-md shadow-inner font-semibold text-left"
                        onClick={() => {
                          navigator.clipboard.writeText(
                            generatedFeedback.toString()
                          );
                          toast("Feedback copied to clipboard", {
                            icon: "✂️",
                          });
                        }}
                      >
                        {/* <p className={"dark:text-black"}>{generatedFeedback}</p> */}
                        {/* <div className='max-w-full overflow-x-auto whitespace-pre-wrap bg-transparent'> */}
                        <ReactMarkdown
                          remarkPlugins={[[remarkGfm, { singleTilde: false }]]}
                          children={generatedFeedback.toString()}
                          className="markdown-body"
                          components={{
                            code({
                              node,
                              inline,
                              className,
                              children,
                              ...props
                            }) {
                              return inline ? (
                                <code className={className} {...props}>
                                  {children}
                                </code>
                              ) : (
                                <div style={{ overflowX: "auto" }}>
                                  <pre
                                    style={{
                                      // transparent background
                                      // backgroundColor: "transparent",
                                      // background: "transparent",
                                      padding: "1em",
                                      borderRadius: "5px",
                                      maxWidth: "inherit",
                                      overflowX: "auto",
                                      whiteSpace: "pre-wrap",
                                      // background: "white",
                                    }}
                                  >
                                    <code className={className} {...props}>
                                      {children}
                                    </code>
                                  </pre>
                                </div>
                              );
                            },
                          }}
                        />
                        {/* </div> */}

                        <a
                          href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
                            `I honestly had no idea what ${url} did until I used siteexplainer.com 🔥`
                          )}`}
                          target="_blank"
                          className="text-[#1da1f2] font-medium text-sm px-5 py-2.5 text-center inline-flex items-center hover:opacity-80"
                        >
                          <svg
                            className="w-4 h-4 mr-2 -ml-1"
                            aria-hidden="true"
                            focusable="false"
                            data-prefix="fab"
                            data-icon="twitter"
                            role="img"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 512 512"
                          >
                            <path
                              fill="currentColor"
                              d="M459.4 151.7c.325 4.548 .325 9.097 .325 13.65 0 138.7-105.6 298.6-298.6 298.6-59.45 0-114.7-17.22-161.1-47.11 8.447 .974 16.57 1.299 25.34 1.299 49.06 0 94.21-16.57 130.3-44.83-46.13-.975-84.79-31.19-98.11-72.77 6.498 .974 12.99 1.624 19.82 1.624 9.421 0 18.84-1.3 27.61-3.573-48.08-9.747-84.14-51.98-84.14-102.1v-1.299c13.97 7.797 30.21 12.67 47.43 13.32-28.26-18.84-46.78-51.01-46.78-87.39 0-19.49 5.197-37.36 14.29-52.95 51.65 63.67 129.3 105.3 216.4 109.8-1.624-7.797-2.599-15.92-2.599-24.04 0-57.83 46.78-104.9 104.9-104.9 30.21 0 57.5 12.67 76.67 33.14 23.72-4.548 46.46-13.32 66.6-25.34-7.798 24.37-24.37 44.83-46.13 57.83 21.12-2.273 41.58-8.122 60.43-16.24-14.29 20.79-32.16 39.31-52.63 54.25z"
                            ></path>
                          </svg>
                          Share on Twitter
                        </a>
                      </div>
                    </div>
                  </>
                )}
              </motion.div>
            </AnimatePresence>
          </ResizablePanel>
        </main>
        <Faq />
        <Footer />
      </div>
    </div>
  );
};

export default Home;
