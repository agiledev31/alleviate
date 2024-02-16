import { Skeleton } from "antd";
import moment from "moment";
import React, { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import { Link, useParams } from "react-router-dom";
import StrapiService from "../service/StrapiService";

const Blog = () => {
  const { id } = useParams();

  const [data, setData] = useState(null);

  useEffect(() => {
    StrapiService.getBlog(id).then(({ data }) => {
      setData(data.blog);
    });
  }, [id]);

  if (!data) return <Skeleton active />;

  return (
    <div className="p-5">
      <div className="mb-8 text-center relative w-full h-[70vh] bg-black">
        <div className="w-full z-10 flex flex-col items-center justify-center absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <h1 className="inline-block mt-6 font-semibold capitalize text-white text-2xl md:text-3xl lg:text-5xl !leading-normal relative w-5/6">
            {data.Title}
          </h1>
        </div>
        <div className="absolute top-0 left-0 right-0 bottom-0 h-full bg-black/60 dark:bg-black/40" />
        <img
          src={process.env.REACT_APP_STRAPI_URL + data.Image?.[0]?.url}
          placeholder="blur"
          height={1280}
          width={700}
          className="aspect-square w-full h-full object-cover object-center"
          priority
          sizes="100vw"
        />
      </div>

      <Link to="/">← Back to Home</Link>

      <div className="mt-5 px-2   bg-indigo-500 text-white py-2 flex items-center justify-around flex-wrap text-lg sm:text-xl font-medium    rounded-lg">
        <time className="m-3">
          {moment(data.published_at).format("LLLL d, yyyy")}
        </time>
        <Link
          //   to={`/categories/${slug(data.tags[0])}`}
          className="m-3"
        >
          #{data.category?.[0]?.Title}
        </Link>
      </div>

      <div
        className="p-10 col-span-12  lg:col-span-8 font-in prose sm:prose-base md:prose-lg max-w-max
    prose-blockquote:bg-indigo-500/20 
    prose-blockquote:p-2
    prose-blockquote:px-6
    prose-blockquote:border-accent
    prose-blockquote:not-italic
    prose-blockquote:rounded-r-lg

    prose-li:marker:text-accent

    first-letter:text-3xl
    sm:first-letter:text-5xl
    


    "
      >
        <ReactMarkdown>{data.body}</ReactMarkdown>
      </div>
    </div>
  );
};

export default Blog;
