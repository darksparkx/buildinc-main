"use client";

import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from "@/components/base/ui/breadcrumb";
import { cn } from "@/lib/functions/utils";
import Link from "next/link";
import * as React from "react";

export type PageBreadcrumbSegment = {
	label: string;
	href?: string;
};

type PageBreadcrumbsProps = {
	items: PageBreadcrumbSegment[];
	className?: string;
	listClassName?: string;
};

export function PageBreadcrumbs({
	items,
	className,
	listClassName,
}: PageBreadcrumbsProps) {
	if (items.length === 0) return null;

	return (
		<Breadcrumb className={className}>
			<BreadcrumbList
				className={cn(
					"!gap-x-1 !gap-y-1 sm:!gap-x-2 sm:!gap-y-1",
					listClassName,
				)}
			>
				{items.map((item, i) => {
					const isLast = i === items.length - 1;
					return (
						<React.Fragment key={`${i}-${item.label}`}>
							{i > 0 ? (
								<BreadcrumbSeparator className="hidden sm:inline-flex" />
							) : null}
							<BreadcrumbItem>
								{isLast ? (
									<BreadcrumbPage
										className="line-clamp-2 max-w-[min(100%,14rem)] text-left sm:max-w-xs md:max-w-md"
										title={item.label}
									>
										{item.label}
									</BreadcrumbPage>
								) : item.href ? (
									<BreadcrumbLink asChild>
										<Link
											href={item.href}
											className="line-clamp-1 max-w-[min(100%,10rem)] sm:max-w-[14rem]"
											title={item.label}
										>
											{item.label}
										</Link>
									</BreadcrumbLink>
								) : (
									<span
										className="line-clamp-1 max-w-[min(100%,10rem)] text-muted-foreground sm:max-w-[14rem]"
										title={item.label}
									>
										{item.label}
									</span>
								)}
							</BreadcrumbItem>
						</React.Fragment>
					);
				})}
			</BreadcrumbList>
		</Breadcrumb>
	);
}
